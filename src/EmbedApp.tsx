import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { ChatMessage } from './types';
import { AiAssistantPanel } from './components/assistant/AiAssistantPanel';
import { AiService } from './services/aiService';
import { CrossKnowledgeContext, CrossKnowledgeService } from './services/crossKnowledgeService';
import {
  ConversationState,
  SavedConversation,
  createConversation,
  deleteConversationRecord,
  getConversationTitle,
  loadConversationState,
  saveConversationState
} from './services/conversationStorage';
import { QuickActionType, ResponseStyle } from './types/assistant';

export const EmbedApp: React.FC = () => {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isPersistenceReady, setIsPersistenceReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageRetry, setStorageRetry] = useState(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const conversationsRef = useRef<SavedConversation[]>([]);
  const activeConversationIdRef = useRef<string | null>(null);
  const pendingDeletesRef = useRef<Set<string>>(new Set());

  const replaceConversations = useCallback((next: SavedConversation[]) => {
    const ordered = [...next].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    conversationsRef.current = ordered;
    setConversations(ordered);
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    activeConversationIdRef.current = id;
    setActiveConversationId(id);
  }, []);

  const enqueueSave = useCallback(
    (snapshot: SavedConversation[], activeId: string): Promise<void> => {
      const save = saveQueue.current.then(async () => {
        await saveConversationState(snapshot, activeId);
        const pendingDeletes = [...pendingDeletesRef.current];
        for (const id of pendingDeletes) {
          await deleteConversationRecord(id);
          pendingDeletesRef.current.delete(id);
        }
      });
      saveQueue.current = save.catch((error: unknown) => {
        setStorageError(error instanceof Error ? error.message : 'Unknown storage error.');
      });
      return save.then(() => setStorageError(null));
    },
    []
  );

  const enqueueDelete = useCallback((id: string): Promise<void> => {
    const deletion = saveQueue.current.then(() => deleteConversationRecord(id));
    saveQueue.current = deletion.catch((error: unknown) => {
      pendingDeletesRef.current.add(id);
      setStorageError(error instanceof Error ? error.message : 'Unknown storage error.');
    });
    return deletion.then(() => {
      pendingDeletesRef.current.delete(id);
      setStorageError(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadConversationState()
      .then((state: ConversationState) => {
        if (cancelled) return;
        const activeExists = state.conversations.some(
          (conversation) => conversation.id === state.activeConversationId
        );
        if (state.conversations.length === 0) {
          const conversation = createConversation();
          replaceConversations([conversation]);
          selectConversation(conversation.id);
        } else {
          replaceConversations(state.conversations);
          selectConversation(
            activeExists ? state.activeConversationId : state.conversations[0].id
          );
        }
        setStorageError(null);
        setIsPersistenceReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStorageError(error instanceof Error ? error.message : 'Unknown storage error.');
      });

    return () => {
      cancelled = true;
    };
  }, [storageRetry, replaceConversations, selectConversation]);

  useEffect(() => {
    if (!isPersistenceReady || !activeConversationId) return;
    const snapshot = conversations;
    const activeId = activeConversationId;
    void enqueueSave(snapshot, activeId).catch(() => undefined);
  }, [conversations, activeConversationId, isPersistenceReady, storageRetry, enqueueSave]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [conversations, activeConversationId]
  );
  const context = activeConversation?.context || {};
  const messages = activeConversation?.messages || [];

  const updateConversation = useCallback(
    (id: string, update: (conversation: SavedConversation) => SavedConversation) => {
      replaceConversations(
        conversationsRef.current.map((conversation) =>
          conversation.id === id ? update(conversation) : conversation
        )
      );
    },
    [replaceConversations]
  );

  const appendMessage = useCallback(
    async (conversationId: string, message: ChatMessage) => {
      updateConversation(conversationId, (conversation) => {
        const updatedMessages = [...conversation.messages, message];
        return {
          ...conversation,
          messages: updatedMessages,
          title: getConversationTitle(updatedMessages),
          updatedAt: new Date().toISOString()
        };
      });
      const updatedConversations = conversationsRef.current;
      const currentActiveId = activeConversationIdRef.current;
      if (currentActiveId) await enqueueSave(updatedConversations, currentActiveId);
    },
    [enqueueSave, updateConversation]
  );

  useEffect(() => {
    if (!isPersistenceReady || !activeConversationId) return;

    const handlePostMessage = (event: MessageEvent) => {
      const allowedOrigins = (window as any).ESTUDY_ALLOWED_ORIGINS || [];
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin) && !event.origin.includes('localhost')) {
        console.warn(`[eStudy AI Embed] Discarded message from unapproved origin: ${event.origin}`);
        return;
      }

      if (event.data && event.data.type === 'ESTUDY_CONTEXT' && event.data.payload) {
        const normalized = CrossKnowledgeService.normalizeContext(event.data.payload);
        const lessonContext = normalized.lessonTitle
          ? `Viewing **${normalized.lessonTitle}**${normalized.moduleName ? ` in ${normalized.moduleName}` : ''}.`
          : 'Your learning context has been synced.';

        updateConversation(activeConversationId, (conversation) => {
          const contextMessage: ChatMessage = {
            id: `msg-sync-${crypto.randomUUID()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `🔄 **LMS Context Updated:** ${lessonContext}\n\nHow can I help?`,
            contextLessonId: normalized.lessonId,
            contextLessonTitle: normalized.lessonTitle,
            suggestions: ['Explain this lesson', 'Give me an example', 'Summarise this lesson']
          };
          const updatedMessages = [...conversation.messages, contextMessage];
          return {
            ...conversation,
            context: normalized,
            messages: updatedMessages,
            title: getConversationTitle(updatedMessages),
            updatedAt: new Date().toISOString()
          };
        });
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [activeConversationId, isPersistenceReady, updateConversation]);

  const handleSendMessage = async (
    query: string,
    actionType: QuickActionType = 'general',
    responseStyle: ResponseStyle = 'detailed'
  ) => {
    if (!activeConversation || storageError || !query.trim()) return;

    const conversationId = activeConversation.id;
    const conversationContext = activeConversation.context as CrossKnowledgeContext;
    const userMsg: ChatMessage = {
      id: `msg-${crypto.randomUUID()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };
    const updatedMessages = [...activeConversation.messages, userMsg];
    const updatedConversation: SavedConversation = {
      ...activeConversation,
      messages: updatedMessages,
      title: getConversationTitle(updatedMessages),
      updatedAt: new Date().toISOString()
    };
    const updatedConversations = conversationsRef.current.map((conversation) =>
      conversation.id === conversationId ? updatedConversation : conversation
    );
    replaceConversations(updatedConversations);
    try {
      await enqueueSave(updatedConversations, conversationId);
    } catch {
      return;
    }

    setIsThinking(true);

    let responseMsg: ChatMessage;
    try {
      responseMsg = await AiService.sendMessage({
        message: query,
        actionType,
        responseStyle,
        context: conversationContext,
        conversationHistory: activeConversation.messages
      });
    } catch {
      responseMsg = {
        id: `msg-err-${crypto.randomUUID()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: 'Sorry, I ran into an issue connecting to the AI service. Please try again.',
        isError: true,
        suggestions: ['Retry question', 'Explain this lesson']
      };
    } finally {
      setIsThinking(false);
    }
    await appendMessage(conversationId, responseMsg).catch(() => undefined);
  };

  const handleNewConversation = () => {
    const conversation = createConversation(context);
    replaceConversations([conversation, ...conversationsRef.current]);
    selectConversation(conversation.id);
  };

  const handleClearCurrentConversation = () => {
    if (!activeConversationId) return;
    updateConversation(activeConversationId, (conversation) => ({
      ...conversation,
      title: 'New conversation',
      messages: [],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleDeleteConversation = (id: string) => {
    const remaining = conversationsRef.current.filter((conversation) => conversation.id !== id);
    if (remaining.length === conversationsRef.current.length) return;
    if (id === activeConversationId) {
      if (remaining.length > 0) {
        replaceConversations(remaining);
        selectConversation(remaining[0].id);
      } else {
        const replacement = createConversation(context);
        replaceConversations([replacement]);
        selectConversation(replacement.id);
      }
      void enqueueDelete(id).catch(() => undefined);
      return;
    }
    replaceConversations(remaining);
    void enqueueDelete(id).catch(() => undefined);
  };

  if (!isPersistenceReady) {
    return (
      <div id="estudy-ai-embed-root" className="w-full h-screen bg-white flex items-center justify-center p-6 font-sans">
        <div role="alert" className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Could not restore your saved conversations
          </div>
          <p>{storageError || 'Conversation storage is still loading.'}</p>
          {storageError && (
            <button
              onClick={() => {
                setStorageError(null);
                setStorageRetry((retry) => retry + 1);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="estudy-ai-embed-root" className="w-full h-screen bg-white overflow-hidden flex flex-col font-sans">
      <AiAssistantPanel
        context={context}
        messages={messages}
        isThinking={isThinking}
        onSendMessage={handleSendMessage}
        onUpdateMessage={(messageId, updates) => {
          if (!activeConversationId) return;
          updateConversation(activeConversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === messageId ? { ...message, ...updates } : message
            ),
            updatedAt: new Date().toISOString()
          }));
          void enqueueSave(conversationsRef.current, activeConversationId).catch(() => undefined);
        }}
        onCollapse={window.parent !== window
          ? () => window.parent.postMessage({ type: 'ESTUDY_CLOSE_WIDGET' }, '*')
          : undefined}
        onResetConversation={handleNewConversation}
        onClearCurrentHistory={handleClearCurrentConversation}
        conversations={conversations.map(({ id, title, updatedAt }) => ({ id, title, updatedAt }))}
        activeConversationId={activeConversationId || undefined}
        onSelectConversation={selectConversation}
        onDeleteConversation={handleDeleteConversation}
        storageError={storageError}
        onRetryStorage={() => setStorageRetry((retry) => retry + 1)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ChatMessage } from './types';
import { AiAssistantPanel } from './components/assistant/AiAssistantPanel';
import { AiService } from './services/aiService';
import { CrossKnowledgeContext, CrossKnowledgeService } from './services/crossKnowledgeService';
import { QuickActionType, ResponseStyle } from './types/assistant';

export const EmbedApp: React.FC = () => {
  const [context, setContext] = useState<CrossKnowledgeContext>({});

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Secure postMessage event listener for CrossKnowledge parent frame
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Validate origin if allowed origins are specified in window config
      const allowedOrigins = (window as any).ESTUDY_ALLOWED_ORIGINS || [];
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin) && !event.origin.includes('localhost')) {
        console.warn(`[eStudy AI Embed] Discarded message from unapproved origin: ${event.origin}`);
        return;
      }

      if (event.data && event.data.type === 'ESTUDY_CONTEXT' && event.data.payload) {
        const normalized = CrossKnowledgeService.normalizeContext(event.data.payload);
        setContext(normalized);
        const lessonContext = normalized.lessonTitle
          ? `Viewing **${normalized.lessonTitle}**${normalized.moduleName ? ` in ${normalized.moduleName}` : ''}.`
          : 'Your learning context has been synced.';

        // Add a notification message that context was synced from host LMS
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-sync-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `🔄 **LMS Context Updated:** ${lessonContext}\n\nHow can I help?`,
            contextLessonId: normalized.lessonId,
            contextLessonTitle: normalized.lessonTitle,
            suggestions: ['Explain this lesson', 'Give me an example', 'Summarise this lesson']
          }
        ]);
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []);

  const handleSendMessage = async (
    query: string,
    actionType: QuickActionType = 'general',
    responseStyle: ResponseStyle = 'detailed'
  ) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const responseMsg = await AiService.sendMessage({
        message: query,
        actionType,
        responseStyle,
        context,
        conversationHistory: messages
      });

      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'Sorry, I ran into an issue connecting to the AI service. Please try again.',
          isError: true,
          suggestions: ['Retry question', 'Explain this lesson']
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
  };

  return (
    <div id="estudy-ai-embed-root" className="w-full h-screen bg-white overflow-hidden flex flex-col font-sans">
      <AiAssistantPanel
        context={context}
        messages={messages}
        isThinking={isThinking}
        onSendMessage={handleSendMessage}
        onCollapse={window.parent !== window
          ? () => window.parent.postMessage({ type: 'ESTUDY_CLOSE_WIDGET' }, '*')
          : undefined}
        onResetConversation={handleResetConversation}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { 
  AssistantContext, 
  ChatMessage, 
  QuickActionType 
} from '../../types/assistant';
import { aiService } from '../../services/aiService';
import { AssistantHeader } from './AssistantHeader';
import { LearnerContextBadge } from './LearnerContextBadge';
import { QuickActions } from './QuickActions';
import { WelcomeView } from './WelcomeView';
import { ChatMessageList } from '../chat/ChatMessageList';
import { ChatInput } from './ChatInput';
import { SettingsModal } from './SettingsModal';

export interface AiAssistantPanelProps {
  /**
   * LMS context passed from the host LMS (CrossKnowledge / eStudy)
   */
  context?: AssistantContext;
  
  /**
   * Optional initial message list
   */
  initialMessages?: ChatMessage[];

  /**
   * Callback when user closes or collapses the panel
   */
  onCollapse?: () => void;

  /**
   * Controlled messages (optional; if not provided, panel maintains internal state)
   */
  messages?: ChatMessage[];

  /**
   * Controlled message handler (optional)
   */
  onSendMessage?: (query: string, actionType?: QuickActionType) => void;

  /**
   * Whether the panel is being rendered in full screen / mobile drawer
   */
  isMobileDrawer?: boolean;

  /**
   * Whether panel width is currently expanded
   */
  isExpanded?: boolean;

  /**
   * Callback to toggle expanded width
   */
  onToggleExpand?: () => void;

  /**
   * Extra container class names
   */
  className?: string;

  // Backward compatibility props
  learner?: any;
  module?: any;
  lesson?: any;
  isThinking?: boolean;
  onResetConversation?: () => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  context,
  initialMessages = [],
  onCollapse,
  messages: externalMessages,
  onSendMessage: externalSendMessage,
  isMobileDrawer = false,
  isExpanded = false,
  onToggleExpand,
  className = '',
  learner,
  module,
  lesson,
  isThinking: externalThinking,
  onResetConversation
}) => {
  // Derive effective context if legacy props passed
  const activeContext: AssistantContext = context || {
    moduleId: module?.id,
    moduleOrder: module?.order,
    moduleTitle: module?.title,
    lessonId: lesson?.id,
    lessonTitle: lesson?.title,
    lessonDescription: lesson?.description,
    learnerId: learner?.id,
    learnerName: learner?.name,
    courseProgress: learner?.courseProgress,
    moduleProgress: module?.progress
  };

  // Internal state when not externally controlled
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>(initialMessages);
  const [isInternallyThinking, setIsInternallyThinking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [responseStyle, setResponseStyle] = useState<'concise' | 'detailed'>('detailed');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('estudy-assistant-theme') === 'dark' ? 'dark' : 'light'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem('estudy-assistant-theme', theme);
  }, [theme]);

  const isControlled = externalMessages !== undefined && externalSendMessage !== undefined;
  const messages = isControlled ? externalMessages : internalMessages;
  const isThinking = externalThinking ?? isInternallyThinking;
  const hasMessages = messages.length > 0;

  const handleSendMessage = async (query: string, actionType: QuickActionType = 'general') => {
    if (isControlled && externalSendMessage) {
      externalSendMessage(query, actionType);
      return;
    }

    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      role: 'learner',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
      actionType,
      contextLessonId: activeContext.lessonId,
      contextLessonTitle: activeContext.lessonTitle
    };

    setInternalMessages((prev) => [...prev, userMsg]);
    setIsInternallyThinking(true);
    setErrorMessage(null);

    try {
      const assistantMsg = await aiService.sendMessage(query, activeContext, actionType, [...internalMessages, userMsg]);
      setInternalMessages((prev) => [...prev, assistantMsg]);

      // Voice read-aloud if enabled
      if (isVoiceEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanSpeech = assistantMsg.content.replace(/[#*`_]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      console.error('Error getting AI response:', err);
      setErrorMessage('Unable to connect to AI Assistant service. Please try again.');
    } finally {
      setIsInternallyThinking(false);
    }
  };

  const handleResetConversation = () => {
    setInternalMessages([]);
    setErrorMessage(null);
    onResetConversation?.();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleActionSelect = (actionType: QuickActionType, promptText?: string) => {
    let query = promptText;
    if (!query) {
      switch (actionType) {
        case 'explain':
          query = `Explain ${activeContext.lessonTitle || 'this lesson'} in structured detail.`;
          break;
        case 'simplify':
          query = `Simplify this lesson in plain, easy-to-understand terms.`;
          break;
        case 'example':
          query = `Provide a real-world workplace example for ${activeContext.lessonTitle || 'this concept'}.`;
          break;
        case 'summarise':
          query = `Summarise the key takeaways of ${activeContext.lessonTitle || 'this lesson'}.`;
          break;
        case 'quiz':
          query = `Test my knowledge on ${activeContext.lessonTitle || 'this lesson'} with a 5-question quiz.`;
          break;
        case 'challenge':
          query = `Start the practical workplace challenge for ${activeContext.lessonTitle || 'this lesson'}.`;
          break;
        default:
          query = 'Help me understand this lesson.';
      }
    }
    handleSendMessage(query, actionType);
  };

  return (
    <aside
      id="ai-assistant-side-panel"
      className={`h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden text-left relative ${
        theme === 'dark' ? 'ai-assistant-dark' : ''
      } ${
        isMobileDrawer ? 'w-full' : 'w-full'
      } ${className}`}
      aria-label="eStudy AI Learning Assistant Panel"
    >
      {/* 1. Header with Controls */}
      <AssistantHeader
        onCollapse={onCollapse}
        onReset={handleResetConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {/* 2. Learner Context Badge (Sync indicator) */}
      <LearnerContextBadge context={activeContext} />

      {/* 3. Quick Action Tools Bar */}
      <QuickActions
        onSelectAction={handleActionSelect}
        disabled={isThinking}
      />

      {/* 4. Main Scrollable Conversation & Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar bg-[#F5F7FA]/30">
        {errorMessage && (
          <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!hasMessages ? (
          <WelcomeView
            context={activeContext}
            onSelectAction={handleActionSelect}
          />
        ) : (
          <ChatMessageList
            messages={messages}
            isThinking={isThinking}
            context={activeContext}
            onSelectSuggestion={(sug) => handleSendMessage(sug, 'general')}
            isVoiceEnabled={isVoiceEnabled}
          />
        )}
      </div>

      {/* 5. Fixed Chat Input */}
      <ChatInput
        onSendMessage={(text) => handleSendMessage(text, 'general')}
        disabled={false}
        isThinking={isThinking}
        lessonTitle={activeContext.lessonTitle}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={handleResetConversation}
        responseStyle={responseStyle}
        onChangeResponseStyle={setResponseStyle}
        theme={theme}
        onChangeTheme={setTheme}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
      />
    </aside>
  );
};

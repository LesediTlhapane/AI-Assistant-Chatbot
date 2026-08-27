import React, { useState } from 'react';
import { Bot, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { 
  Lesson, 
  Module, 
  LearnerProfile, 
  ChatMessage, 
  AssistantMode 
} from '../../types';
import { AssistantHeader } from './AssistantHeader';
import { LearnerContextBadge } from './LearnerContextBadge';
import { QuickActions } from './QuickActions';
import { WelcomeView } from './WelcomeView';
import { ChatMessageList } from '../chat/ChatMessageList';
import { ChatInput } from './ChatInput';
import { SettingsModal } from './SettingsModal';

interface AiAssistantPanelProps {
  learner: LearnerProfile;
  module: Module;
  lesson: Lesson;
  messages: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (query: string, actionType?: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general') => void;
  onCollapse: () => void;
  onResetConversation: () => void;
  isMobileDrawer?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  learner,
  module,
  lesson,
  messages,
  isThinking,
  onSendMessage,
  onCollapse,
  onResetConversation,
  isMobileDrawer = false,
  isExpanded = false,
  onToggleExpand
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [responseStyle, setResponseStyle] = useState<'concise' | 'detailed'>('detailed');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasMessages = messages.length > 0;

  const handleActionSelect = (
    actionType: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge',
    promptText?: string
  ) => {
    onSendMessage(promptText || actionType, actionType);
  };

  return (
    <aside
      id="ai-assistant-side-panel"
      className={`h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden text-left relative ${
        isMobileDrawer ? 'w-full' : 'w-full'
      }`}
      aria-label="eStudy AI Learning Assistant Panel"
    >
      {/* 1. Header */}
      <AssistantHeader
        onCollapse={onCollapse}
        onReset={onResetConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      {/* 2. Learner Context Badge (Demonstrates understanding of module & lesson) */}
      <LearnerContextBadge module={module} lesson={lesson} />

      {/* 3. Quick Action Tools Bar */}
      <QuickActions
        onSelectAction={handleActionSelect}
        disabled={isThinking}
      />

      {/* 4. Main Scrollable Content (Welcome State vs. Conversation Stream) */}
      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar bg-[#F5F7FA]/30">
        {errorMessage && (
          <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-600 hover:bg-rose-100 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!hasMessages ? (
          <WelcomeView
            learner={learner}
            lesson={lesson}
            onSelectAction={handleActionSelect}
          />
        ) : (
          <ChatMessageList
            messages={messages}
            isThinking={isThinking}
            lesson={lesson}
            onSelectSuggestion={(sug) => onSendMessage(sug, 'general')}
            isVoiceEnabled={isVoiceEnabled}
          />
        )}
      </div>

      {/* 5. Fixed Chat Input */}
      <ChatInput
        onSendMessage={(text) => onSendMessage(text, 'general')}
        disabled={false}
        isThinking={isThinking}
        lessonTitle={lesson.title}
      />

      {/* 6. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={onResetConversation}
        responseStyle={responseStyle}
        onChangeResponseStyle={setResponseStyle}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
      />
    </aside>
  );
};

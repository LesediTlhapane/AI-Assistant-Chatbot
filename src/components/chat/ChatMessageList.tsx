import React, { useEffect, useRef } from 'react';
import { ChatMessage, Lesson } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { ThinkingIndicator } from './ThinkingIndicator';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isThinking: boolean;
  lesson: Lesson;
  onSelectSuggestion: (suggestion: string) => void;
  isVoiceEnabled: boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isThinking,
  lesson,
  onSelectSuggestion,
  isVoiceEnabled
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div id="ai-chat-messages-container" className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 custom-scrollbar">
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          lesson={lesson}
          onSelectSuggestion={onSelectSuggestion}
          isVoiceEnabled={isVoiceEnabled}
        />
      ))}

      {isThinking && <ThinkingIndicator />}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};

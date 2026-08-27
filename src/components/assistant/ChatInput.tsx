import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  isThinking?: boolean;
  lessonTitle?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  isThinking = false,
  lessonTitle
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || disabled || isThinking) return;

    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleToggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice dictation is supported in modern Chrome, Edge, and Safari browsers.');
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-ZA';

      if (!isListening) {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div id="ai-chat-input-wrapper" className="p-3 bg-white border-t border-gray-200 shrink-0">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-end gap-1.5 rounded-2xl border bg-[#F5F7FA] p-1.5 transition-all ${
          isThinking ? 'opacity-70 border-gray-200' : 'border-gray-300 focus-within:border-[#052B66] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#052B66]/10'
        }`}>
          
          {/* Textarea */}
          <textarea
            id="chat-user-input"
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={lessonTitle ? `Ask anything about ${lessonTitle}...` : "Ask anything about this lesson..."}
            disabled={disabled || isThinking}
            className="w-full max-h-24 bg-transparent px-3 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden resize-none leading-relaxed"
            aria-label="Ask the AI learning assistant a question"
          />

          {/* Action buttons inside input box */}
          <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              disabled={disabled || isThinking}
              className={`p-2 rounded-xl text-xs transition-colors ${
                isListening
                  ? 'bg-rose-100 text-rose-600 animate-pulse'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/60'
              }`}
              title={isListening ? 'Listening...' : 'Voice dictation'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              id="btn-send-chat-message"
              type="submit"
              disabled={!inputText.trim() || disabled || isThinking}
              className={`p-2 rounded-xl text-white transition-all shadow-xs ${
                inputText.trim() && !isThinking
                  ? 'bg-[#052B66] hover:bg-blue-900 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="hidden sm:inline">eStudy CrossKnowledge AI</span>
        </div>
      </form>
    </div>
  );
};

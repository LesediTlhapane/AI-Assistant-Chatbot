import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  Bookmark, 
  Sparkles, 
  Lightbulb, 
  BrainCircuit, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { ChatMessage, Lesson } from '../../types';
import { InteractiveQuiz } from '../quiz/InteractiveQuiz';
import { PracticalChallenge } from '../challenge/PracticalChallenge';

interface ChatMessageItemProps {
  message: ChatMessage;
  lesson: Lesson;
  onSelectSuggestion?: (suggestion: string) => void;
  isVoiceEnabled?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  lesson,
  onSelectSuggestion,
  isVoiceEnabled
}) => {
  const isUser = message.sender === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = message.content.replace(/[#*`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Simple, clean Markdown-like parser for bold, bullet lists, headings, and code fragments
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      // Empty line
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Heading 3: ### Title
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-xs sm:text-sm font-bold text-[#052B66] mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }

      // Heading 4 / Subheading: #### Title
      if (line.startsWith('#### ')) {
        return (
          <h5 key={index} className="text-xs font-bold text-gray-800 mt-1 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }

      // Bullet Point: - Item or * Item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.substring(2);
        return (
          <div key={index} className="flex items-start gap-2 text-xs leading-relaxed my-0.5 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] mt-1.5 shrink-0" />
            <span>{parseInlineFormatting(bulletText)}</span>
          </div>
        );
      }

      // Numbered List: 1. Item
      const matchNumber = line.match(/^(\d+)\.\s+(.*)/);
      if (matchNumber) {
        return (
          <div key={index} className="flex items-start gap-2 text-xs leading-relaxed my-0.5 pl-1">
            <span className="font-bold text-[#052B66] shrink-0 text-[11px] mt-0.5">{matchNumber[1]}.</span>
            <span>{parseInlineFormatting(matchNumber[2])}</span>
          </div>
        );
      }

      // Standard Paragraph
      return (
        <p key={index} className="text-xs leading-relaxed my-1">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  // Parses **bold** and `code`
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-gray-100 text-[#052B66] rounded font-mono text-[11px] border border-gray-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={`flex items-start gap-2.5 p-3.5 my-1.5 animate-in fade-in duration-200 text-left ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-2xs ${
          isUser
            ? 'bg-[#052B66] text-white ring-2 ring-[#45CC42]/30'
            : 'bg-gradient-to-tr from-[#052B66] to-[#0A4B9F] text-white'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[88%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Main Message Bubble */}
        <div
          className={`p-3.5 rounded-2xl shadow-2xs text-xs sm:text-sm ${
            isUser
              ? 'bg-[#052B66] text-white rounded-tr-xs'
              : 'bg-white border border-gray-200/90 text-gray-800 rounded-tl-xs'
          }`}
        >
          {/* Formatted Content */}
          <div className="space-y-1">
            {renderFormattedContent(message.content)}
          </div>

          {/* Embedded Quiz if present */}
          {message.quizData && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <InteractiveQuiz questions={message.quizData.questions} />
            </div>
          )}

          {/* Embedded Challenge if present */}
          {message.challengeData && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <PracticalChallenge scenario={message.challengeData.scenario} />
            </div>
          )}

          {/* Timestamp & Actions */}
          <div className={`mt-2 pt-1.5 flex items-center justify-between text-[10px] ${
            isUser ? 'text-blue-200/80 border-t border-white/10' : 'text-gray-400 border-t border-gray-100'
          }`}>
            <span>{message.timestamp}</span>

            {!isUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeak}
                  className="p-1 hover:text-[#052B66] rounded transition-colors"
                  title="Read aloud"
                  aria-label="Read message aloud"
                >
                  <Volume2 className="w-3 h-3" />
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-[#052B66] rounded transition-colors flex items-center gap-0.5"
                  title="Copy text"
                  aria-label="Copy message text"
                >
                  {isCopied ? <Check className="w-3 h-3 text-[#45CC42]" /> : <Copy className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-1 rounded transition-colors ${
                    isSaved ? 'text-amber-500' : 'hover:text-[#052B66]'
                  }`}
                  title={isSaved ? 'Saved to study notes' : 'Save note'}
                  aria-label="Save note"
                >
                  <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Suggestion Chips ("Want to explore this further?") */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
              Want to explore this further?
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {message.suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => onSelectSuggestion(sug)}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-[#052B66]/20 text-[#052B66] hover:bg-[#052B66] hover:text-white hover:border-[#052B66] transition-all shadow-2xs active:scale-95 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#45CC42]" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

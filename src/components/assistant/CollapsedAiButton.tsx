import React from 'react';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

interface CollapsedAiButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export const CollapsedAiButton: React.FC<CollapsedAiButtonProps> = ({
  onClick,
  unreadCount = 0
}) => {
  return (
    <button
      id="btn-collapsed-ask-ai"
      onClick={onClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-[#052B66] hover:bg-blue-900 text-white pl-3.5 pr-2.5 py-4 rounded-l-2xl shadow-xl flex flex-col items-center gap-2 border-y border-l border-white/20 transition-all hover:pl-4 group focus:outline-hidden focus:ring-2 focus:ring-[#45CC42]"
      aria-label="Open eStudy AI Learning Assistant"
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Bot className="w-4 h-4 text-[#45CC42]" />
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#45CC42] rounded-full border-2 border-[#052B66] animate-pulse" />
      </div>

      <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-bold tracking-wider uppercase text-gray-100 py-1">
        Ask AI
      </span>

      <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
    </button>
  );
};

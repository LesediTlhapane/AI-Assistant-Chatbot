import React from 'react';
import { Bot } from 'lucide-react';

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
      id="btn-collapsed-ask eStudy AI.."
      onClick={onClick}
      className="fixed top-32 right-20 z-[100] flex items-center gap-2 rounded-full border border-green-200 bg-green-100/70 px-3 py-2 text-gray-800 shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-hidden focus:ring-2 focus:ring-[#45CC42]"
      aria-label="Open eStudy AI Learning Assistant"
    >
      <div className="relative">
        <div className="flex h-10 w-15 items-center justify-center rounded-full bg-[#052B66]">
          <Bot className="h-5 w-5 text-[#45CC42]" />
        </div>
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#45CC42]" />
      </div>

      <span className="text-sm font-semibold">
        Ask eStudy AI
      </span>
    </button>
  );
};

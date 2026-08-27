import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div id="ai-thinking-indicator" className="flex items-start gap-2.5 p-3.5 my-2 animate-in fade-in duration-200">
      {/* Bot Icon */}
      <div className="w-7 h-7 rounded-xl bg-[#052B66] text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-white border border-gray-200/90 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs space-y-1.5 max-w-[85%]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#052B66]">
          <Sparkles className="w-3.5 h-3.5 text-[#45CC42] animate-spin" style={{ animationDuration: '3s' }} />
          <span>eStudy AI is thinking...</span>
        </div>

        {/* Elegant pulsating dots */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="w-2 h-2 rounded-full bg-[#052B66]/40 animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#052B66]/60 animate-pulse" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#45CC42] animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};

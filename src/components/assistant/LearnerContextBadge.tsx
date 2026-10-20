import React from 'react';
import { Sparkles } from 'lucide-react';
import { AssistantContext } from '../../types/assistant';

interface LearnerContextBadgeProps {
  context: AssistantContext;
}

export const LearnerContextBadge: React.FC<LearnerContextBadgeProps> = ({ context }) => {
  const moduleLabel = context.moduleTitle || (context.moduleOrder ? `Module ${context.moduleOrder}` : 'Module 2 — AI in the Workplace');
  const lessonLabel = context.lessonTitle || 'Prompt Engineering for Business Teams';

  return (
    <div
      id="ai-learner-context-badge"
      className="px-3.5 py-2 bg-[#F5F7FA] border-b border-gray-200/80 flex items-center justify-between text-xs text-gray-600 gap-2 shrink-0"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-2 h-2 rounded-full bg-[#45CC42] shrink-0 animate-pulse" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            <span>Currently learning</span>
            <span>·</span>
            <span className="truncate">{moduleLabel}</span>
          </div>
          <p className="text-xs font-bold text-[#052B66] truncate leading-tight">
            {lessonLabel}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
        <Sparkles className="w-3 h-3 text-[#45CC42]" />
        <span>Context Synced</span>
      </div>
    </div>
  );
};

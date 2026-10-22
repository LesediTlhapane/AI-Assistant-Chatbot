import React from 'react';
import { Sparkles, Compass, BrainCircuit, ArrowRight } from 'lucide-react';
import { AssistantContext, QuickActionType } from '../../types/assistant';
import { AssistantLogo } from './AssistantLogo';

interface WelcomeViewProps {
  context: AssistantContext;
  onSelectAction: (actionType: QuickActionType, promptText?: string) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  context,
  onSelectAction
}) => {
  const learnerName = context.learnerName;
  const lessonTitle = context.lessonTitle;

  return (
    <div id="ai-assistant-welcome-view" className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
      
      {/* Friendly Greeting Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs space-y-3.5 text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs overflow-hidden">
            <AssistantLogo className="w-full h-full" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#101828]">
              Hi {learnerName || 'there'} 👋
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">Your learning companion</p>
          </div>
        </div>

        {/* Current topic context */}
        {lessonTitle && (
          <div className="bg-[#052B66]/5 rounded-xl p-3 border border-[#052B66]/10">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Currently studying</p>
            <p className="text-xs sm:text-sm font-bold text-[#052B66] leading-snug">{lessonTitle}</p>
          </div>
        )}

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {lessonTitle
            ? 'Ask me anything about this topic — I can explain concepts, give examples, simplify ideas, or quiz you.'
            : 'Ask me anything — I can explain concepts, give examples, simplify ideas, or quiz you.'}
        </p>

        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="font-bold text-[#101828]">Get started</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#45CC42] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] animate-pulse" />
            Ready
          </span>
        </div>
      </div>

      {/* Suggested Actions (The 3 Primary Actions from Specification) */}
      <div className="space-y-2 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Suggested Actions
        </p>
        
        {/* 1. Explain a concept */}
        <button
          onClick={() => onSelectAction('explain', lessonTitle ? `Explain ${lessonTitle} in detail.` : 'Explain a concept for me.')}
          className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-[#052B66] hover:bg-[#052B66]/5 transition-all flex items-center justify-between gap-3 group active:scale-[0.99] shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#052B66]/5 text-[#052B66] group-hover:bg-[#052B66] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#45CC42]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#101828] group-hover:text-[#052B66] transition-colors block">
                {lessonTitle ? 'Explain this lesson' : 'Explain a concept'}
              </span>
              <p className="text-[11px] text-gray-500 truncate">
                Get a clear, structured breakdown of core concepts
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#052B66] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 2. Give me an example */}
        <button
          onClick={() => onSelectAction('example', 'Give me a practical workplace example.')}
          className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-[#052B66] hover:bg-[#052B66]/5 transition-all flex items-center justify-between gap-3 group active:scale-[0.99] shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#052B66]/5 text-[#052B66] group-hover:bg-[#052B66] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#45CC42]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#101828] group-hover:text-[#052B66] transition-colors block">
                Give me an example
              </span>
              <p className="text-[11px] text-gray-500 truncate">
                Real-world business and workplace scenarios
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#052B66] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 3. Test my knowledge */}
        <button
          onClick={() => onSelectAction('quiz', 'Test my knowledge with a 5-question quiz.')}
          className="w-full text-left p-3 rounded-xl bg-white border border-[#45CC42]/40 hover:border-[#45CC42] hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-3 group active:scale-[0.99] shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 group-hover:bg-[#45CC42] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#101828] group-hover:text-emerald-900 transition-colors">
                  Test my knowledge
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-sm">
                  5 Questions
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                Interactive quick-check with instant feedback
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>

    </div>
  );
};

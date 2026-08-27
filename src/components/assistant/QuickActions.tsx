import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  FileText, 
  Award, 
  Compass, 
  Zap, 
  BrainCircuit 
} from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (actionType: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge') => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectAction,
  disabled = false
}) => {
  const actions = [
    {
      id: 'explain',
      label: 'Explain',
      icon: Sparkles,
      color: 'hover:border-[#052B66] hover:bg-[#052B66]/5 text-[#052B66]',
      bg: 'bg-white'
    },
    {
      id: 'simplify',
      label: 'Simplify',
      icon: Lightbulb,
      color: 'hover:border-amber-500 hover:bg-amber-50 text-amber-900',
      bg: 'bg-white'
    },
    {
      id: 'example',
      label: 'Example',
      icon: Compass,
      color: 'hover:border-blue-600 hover:bg-blue-50 text-blue-900',
      bg: 'bg-white'
    },
    {
      id: 'summarise',
      label: 'Summarise',
      icon: FileText,
      color: 'hover:border-purple-600 hover:bg-purple-50 text-purple-900',
      bg: 'bg-white'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: BrainCircuit,
      color: 'hover:border-[#45CC42] hover:bg-emerald-50 text-emerald-900 font-bold',
      bg: 'bg-emerald-50/50 border-emerald-200'
    },
    {
      id: 'challenge',
      label: 'Challenge',
      icon: Award,
      color: 'hover:border-[#052B66] hover:bg-blue-50 text-[#052B66] font-bold',
      bg: 'bg-blue-50/50 border-blue-200'
    }
  ] as const;

  return (
    <div id="ai-quick-actions-bar" className="px-3.5 py-2 bg-white border-b border-gray-100 shrink-0">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 mr-0.5">
          Tools:
        </span>
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onSelectAction(act.id)}
              disabled={disabled}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed ${act.bg} ${act.color} active:scale-95`}
              aria-label={`Run ${act.label} learning action`}
            >
              <Icon className="w-3 h-3 text-[#45CC42]" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

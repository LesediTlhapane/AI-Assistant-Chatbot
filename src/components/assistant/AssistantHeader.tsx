import React from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize2, 
  Minimize2,
  ChevronRight 
} from 'lucide-react';

interface AssistantHeaderProps {
  onCollapse: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  onCollapse,
  onReset,
  onOpenSettings,
  isVoiceEnabled,
  onToggleVoice,
  isExpanded = false,
  onToggleExpand
}) => {
  return (
    <div id="ai-assistant-header" className="p-3 sm:p-3.5 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center justify-between gap-2">
        {/* Left: AI Avatar & Title & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#052B66] to-[#0A4B9F] flex items-center justify-center text-white shadow-2xs">
              <Bot className="w-4 h-4 text-[#45CC42]" />
            </div>
            {/* Online Indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#45CC42] border-2 border-white rounded-full"
              title="Online and synced"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-[#101828] truncate leading-tight">
                eStudy AI Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              Your learning companion
            </p>
          </div>
        </div>

        {/* Right: Header controls (🔊 ↻ ⚙ ↗ ✕) */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Audio / Read-aloud toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isVoiceEnabled
                ? 'bg-blue-50 text-[#052B66]'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={isVoiceEnabled ? 'Voice read-aloud: Active' : 'Voice read-aloud: Off'}
            aria-label="Toggle voice"
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-[#052B66]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* New conversation */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="New conversation"
            aria-label="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Assistant settings"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Expand / Narrow Width toggle on desktop (↗) */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={isExpanded ? 'Standard width (380px)' : 'Expand width (580px)'}
              aria-label="Toggle expanded width"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Collapse Panel */}
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-0.5"
            title="Collapse assistant"
            aria-label="Collapse assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

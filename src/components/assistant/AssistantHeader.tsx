import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  History,
  Trash2
} from 'lucide-react';
import { AssistantLogo } from './AssistantLogo';
import { ConversationSummary, ResponseStyle } from '../../types/assistant';

interface AssistantHeaderProps {
  onCollapse?: () => void;
  onReset: () => void;
  onNewConversation?: () => void;
  onOpenSettings: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  responseStyle: ResponseStyle;
  onChangeResponseStyle: (style: ResponseStyle) => void;
  conversations?: ConversationSummary[];
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  onCollapse,
  onReset,
  onNewConversation,
  onOpenSettings,
  isVoiceEnabled,
  onToggleVoice,
  responseStyle,
  onChangeResponseStyle,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isExpanded = false,
  onToggleExpand
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div id="ai-assistant-header" className="p-3 sm:p-3.5 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center justify-between gap-2">
        {/* Left: AI Avatar & Title & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs overflow-hidden">
              <AssistantLogo className="w-full h-full" />
            </div>
            {/* Online Indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#45CC42] border-2 border-white rounded-full"
              title="Assistant online"
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
          <label className="sr-only" htmlFor="header-response-style">Explanation depth</label>
          <select
            id="header-response-style"
            value={responseStyle}
            onChange={(event) => onChangeResponseStyle(event.target.value as ResponseStyle)}
            className="h-7 w-[82px] rounded-md border border-gray-200 bg-white px-1.5 text-[10px] font-semibold text-gray-600 outline-none hover:border-gray-300 focus:border-[#052B66]"
            title="Explanation depth"
            aria-label="Explanation depth"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
          </select>

          {onSelectConversation && (
            <div className="relative">
              <button
                onClick={() => setIsHistoryOpen((open) => !open)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Conversation history"
                aria-label="Conversation history"
                aria-expanded={isHistoryOpen}
              >
                <History className="w-4 h-4" />
              </button>
              {isHistoryOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl z-50 p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Saved conversations</p>
                  {conversations.length === 0 && (
                    <p className="px-2 py-3 text-xs text-gray-500">No saved conversations yet.</p>
                  )}
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-1 rounded-lg ${
                        conversation.id === activeConversationId ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectConversation(conversation.id);
                          setIsHistoryOpen(false);
                        }}
                        className="min-w-0 flex-1 px-2 py-2 text-left"
                        title={conversation.title}
                      >
                        <span className="block truncate text-xs font-semibold text-gray-800">{conversation.title}</span>
                        <span className="block text-[10px] text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleString()}
                        </span>
                      </button>
                      {onDeleteConversation && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete “${conversation.title}” and its saved messages? This cannot be undone.`)) {
                              onDeleteConversation(conversation.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-rose-600"
                          title="Delete conversation"
                          aria-label={`Delete ${conversation.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
            onClick={onNewConversation || onReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Start a new conversation"
            aria-label="Start a new conversation"
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

          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-0.5"
              title="Collapse assistant"
              aria-label="Collapse assistant"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import { X, Trash2, Sliders, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  responseStyle: 'concise' | 'detailed';
  onChangeResponseStyle: (style: 'concise' | 'detailed') => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  onClearHistory,
  responseStyle,
  onChangeResponseStyle,
  isVoiceEnabled,
  onToggleVoice
}: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#052B66]" />
            <h3 className="text-sm font-bold text-[#101828]">Assistant Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs">
          
          {/* Response Style */}
          <div className="space-y-2">
            <label className="font-bold text-gray-700 block">Explanation Depth:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeResponseStyle('concise')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  responseStyle === 'concise'
                    ? 'border-[#052B66] bg-[#052B66]/5 text-[#052B66]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Executive & Concise
              </button>
              <button
                onClick={() => onChangeResponseStyle('detailed')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                  responseStyle === 'detailed'
                    ? 'border-[#052B66] bg-[#052B66]/5 text-[#052B66]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Comprehensive & In-Depth
              </button>
            </div>
          </div>

          {/* Voice Audio Feedback */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] border border-gray-200">
            <div>
              <p className="font-bold text-gray-800">Voice Read-Aloud</p>
              <p className="text-[11px] text-gray-500">Read assistant explanations out loud</p>
            </div>
            <button
              onClick={onToggleVoice}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isVoiceEnabled ? 'bg-[#45CC42]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform absolute top-0.5 ${
                  isVoiceEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Context Sync Info */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-[#052B66]" />
              <span>CrossKnowledge LMS Sync Active</span>
            </div>
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              The assistant dynamically shifts context as you navigate modules and lessons across your course.
            </p>
          </div>

          {/* Reset chat */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500">Reset Current Conversation:</span>
            <button
              onClick={() => {
                onClearHistory();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Chat History
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#052B66] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

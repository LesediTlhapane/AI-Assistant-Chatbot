import React, { useState } from 'react';
import { 
  Award, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeScenario, ChallengeEvaluation } from '../../types/assistant';
import { aiService } from '../../services/aiService';

interface PracticalChallengeProps {
  scenario: ChallengeScenario;
  onCompleted?: () => void;
}

export const PracticalChallenge: React.FC<PracticalChallengeProps> = ({
  scenario,
  onCompleted
}) => {
  const [userText, setUserText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [showConsiderations, setShowConsiderations] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await aiService.evaluateChallenge(userText, scenario, {});
      setEvaluation(result);
      if (result.score >= 75) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      if (onCompleted) onCompleted();
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleInsertTemplate = () => {
    setUserText(
      `1. Document Curation: Audit, deduplicate, and sanitize the 200 SOPs before ingesting into the knowledge base.\n2. Data Privacy (POPIA): Strip sensitive client/employee PII and ensure enterprise-level zero-data retention.\n3. 30-Day Metrics: Track query resolution speed, accuracy ratings, and staff adoption rates.`
    );
  };

  return (
    <div id="ai-practical-challenge-card" className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-2 text-left">
      
      {/* Title & Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#052B66] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-[#45CC42]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Workplace Challenge
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-[#101828]">
              {scenario.title}
            </h4>
          </div>
        </div>

        <span className="shrink-0 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Coaching Activity
        </span>
      </div>

      {/* Scenario Brief */}
      <div className="bg-[#F5F7FA] rounded-xl p-3.5 border border-gray-200/70 space-y-2">
        <p className="text-xs text-gray-700 leading-relaxed">
          {scenario.scenario}
        </p>

        <div className="pt-2 border-t border-gray-200/60">
          <p className="text-xs font-bold text-[#052B66]">
            📌 Task: {scenario.promptQuestion}
          </p>
        </div>
      </div>

      {/* Accordion: Key Considerations */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowConsiderations(!showConsiderations)}
          className="w-full px-3 py-2 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between text-xs font-semibold text-gray-600 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#45CC42]" />
            Key considerations to include
          </span>
          {showConsiderations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showConsiderations && (
          <div className="p-3 bg-white space-y-1.5 text-xs text-gray-600 border-t border-gray-100">
            {scenario.keyConsiderations.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Results if evaluated */}
      {evaluation ? (
        <div className="space-y-3.5 animate-in fade-in duration-300">
          {/* Score Header */}
          <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-xl p-3.5 border border-emerald-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                AI Assessment Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#052B66]">{evaluation.score}</span>
                <span className="text-xs font-bold text-gray-400">/ 100</span>
              </div>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-700 border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42]" />
              <span>{evaluation.score >= 75 ? 'Competent' : 'Needs Refinement'}</span>
            </div>
          </div>

          {/* Feedback Body */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-3 text-xs">
            <p className="text-gray-700 leading-relaxed font-medium">
              {evaluation.expertFeedback}
            </p>

            {/* Strengths */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#45CC42]" /> Strengths:
              </span>
              {evaluation.strengths.map((str, sIdx) => (
                <div key={sIdx} className="pl-3.5 text-gray-600">
                  • {str}
                </div>
              ))}
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" /> Opportunities for Improvement:
              </span>
              {evaluation.areasToImprove.map((area, aIdx) => (
                <div key={aIdx} className="pl-3.5 text-gray-600">
                  • {area}
                </div>
              ))}
            </div>
          </div>

          {/* Retry Button */}
          <button
            onClick={() => {
              setEvaluation(null);
              setUserText('');
            }}
            className="w-full py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Another Submission</span>
          </button>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="challenge-response" className="text-xs font-bold text-gray-700">
                Your Recommendations:
              </label>
              <button
                type="button"
                onClick={handleInsertTemplate}
                className="text-[11px] font-semibold text-[#052B66] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#45CC42]" />
                Insert Starter Plan
              </button>
            </div>

            <textarea
              id="challenge-response"
              rows={4}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Draft your 3-step rollout plan here (document curation, data privacy & POPIA, 30-day KPIs)..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#052B66]/20 focus:border-[#052B66] leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={!userText.trim() || isEvaluating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#052B66] text-white hover:bg-[#0A4B9F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#45CC42] animate-spin" />
                  <span>Evaluating submission...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#45CC42]" />
                  <span>Submit for AI Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

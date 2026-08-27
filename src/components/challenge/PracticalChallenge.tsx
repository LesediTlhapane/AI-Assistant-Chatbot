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
  ShieldCheck, 
  BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChallengeScenario, ChallengeEvaluation } from '../../types';
import { AiSimulatorService } from '../../services/aiSimulator';

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
      const result = await AiSimulatorService.evaluateChallenge(userText, scenario);
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
      `1. Data Privacy & POPIA: Ensure confidential business data and client PII are never entered into public AI tools.\n2. Verification & Human Oversight: Require employees to review every draft for factual accuracy to prevent hallucinations.\n3. Training: Provide prompt engineering workshops (RTCF framework) to get consistent results.`
    );
  };

  return (
    <div id="ai-practical-challenge-card" className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-2 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#052B66] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#052B66]">Practical Challenge</span>
        </div>
        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Workplace Application
        </span>
      </div>

      {/* Scenario Brief */}
      <div className="bg-[#F5F7FA] rounded-xl p-3.5 border border-gray-200/80 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Scenario Context:
        </span>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          {scenario.scenario}
        </p>
      </div>

      {/* Question Prompt */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-[#101828]">
          Challenge Task:
        </h4>
        <p className="text-xs sm:text-sm text-gray-800 font-semibold leading-relaxed">
          {scenario.promptQuestion}
        </p>
      </div>

      {/* Collapsible Key Considerations Drawer */}
      <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowConsiderations(!showConsiderations)}
          className="w-full px-3 py-2 bg-gray-50 flex items-center justify-between font-semibold text-gray-600 hover:text-gray-900"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#052B66]" />
            Hints & Key Considerations
          </span>
          {showConsiderations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showConsiderations && (
          <div className="p-3 bg-white space-y-1.5 border-t border-gray-200 text-gray-600">
            {scenario.keyConsiderations.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] mt-1.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form submission / Feedback */}
      {!evaluation ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <label htmlFor="challenge-answer-input" className="font-semibold text-gray-700">Your Recommended Approach:</label>
            <button
              type="button"
              onClick={handleInsertTemplate}
              className="text-[#052B66] hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3 text-[#45CC42]" />
              Use example starter
            </button>
          </div>

          <textarea
            id="challenge-answer-input"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Outline your recommendations for data privacy, human review protocols, and team guidelines..."
            rows={4}
            className="w-full p-3 text-xs rounded-xl border border-gray-300 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] text-gray-800 placeholder:text-gray-400 resize-none transition-all"
            disabled={isEvaluating}
            required
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-gray-400">
              AI evaluates on POPIA, human review & governance.
            </span>

            <button
              type="submit"
              disabled={!userText.trim() || isEvaluating}
              className="px-4 py-2 bg-[#052B66] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#45CC42] animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <span>Submit My Answer</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Results Card */
        <div className="space-y-4 pt-2 border-t border-gray-100 animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Evaluation Score
              </span>
              <p className="text-lg font-black text-emerald-900">{evaluation.score} / 100</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42]" />
                Proficient
              </span>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-1.5 text-xs">
            <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#45CC42]" />
              Identified Strengths:
            </h5>
            <ul className="space-y-1 pl-5 list-disc text-gray-700">
              {evaluation.strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Areas to improve */}
          {evaluation.areasToImprove.length > 0 && (
            <div className="space-y-1.5 text-xs">
              <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Key Recommendations to Strengthen:
              </h5>
              <ul className="space-y-1 pl-5 list-disc text-gray-700">
                {evaluation.areasToImprove.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Expert Summary */}
          <div className="p-3 bg-[#F5F7FA] rounded-xl text-xs text-gray-700 border border-gray-200 space-y-1">
            <strong className="text-[#052B66]">Instructor Insight:</strong>
            <p className="leading-relaxed">{evaluation.expertFeedback}</p>
          </div>

          <button
            onClick={() => {
              setEvaluation(null);
              setUserText('');
            }}
            className="w-full py-2 bg-[#F5F7FA] hover:bg-gray-200 text-[#052B66] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Another Response
          </button>
        </div>
      )}

    </div>
  );
};

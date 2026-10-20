import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Check, 
  Lightbulb, 
  BrainCircuit 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../../types/assistant';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
  onRestart?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  onComplete,
  onRestart
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];
  const total = questions.length;
  const isCorrect = selectedOption === currentQ.correctAnswerId;

  const handleSelectOption = (optionId: string) => {
    if (hasAnswered) return;
    setSelectedOption(optionId);
    setHasAnswered(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
      const score = Object.entries({ ...userAnswers, [currentIndex]: selectedOption || '' }).filter(
        ([idx, ans]) => ans === questions[Number(idx)]?.correctAnswerId
      ).length;
      
      if (score >= Math.ceil(total * 0.7)) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      if (onComplete) onComplete(score, total);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setUserAnswers({});
    setIsFinished(false);
    if (onRestart) onRestart();
  };

  const calculateFinalScore = () => {
    return Object.entries(userAnswers).filter(
      ([idx, ans]) => ans === questions[Number(idx)]?.correctAnswerId
    ).length;
  };

  // Completion Screen
  if (isFinished) {
    const finalScore = calculateFinalScore();
    const percentage = Math.round((finalScore / total) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-2 text-left">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#101828]">
              {passed ? 'Quiz Completed Successfully! 🎉' : 'Quiz Completed — Review Recommended'}
            </h4>
            <p className="text-xs text-gray-500">
              You scored {finalScore} out of {total} ({percentage}%)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              passed ? 'bg-[#45CC42]' : 'bg-amber-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Educational Feedback */}
        <div className="bg-[#F5F7FA] p-3 rounded-xl text-xs text-gray-600 space-y-1">
          <span className="font-bold text-[#052B66] block">Instructor Feedback:</span>
          <p>
            {passed
              ? 'Excellent comprehension of core generative AI principles and governance standards!'
              : 'Good effort! Revisit the key takeaways regarding human-in-the-loop and prompt design.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleReset}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div id="ai-interactive-quiz-container" className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-2 text-left">
      
      {/* Header & Progress Indicator */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#101828]">Knowledge Check</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-400">
            Question {currentIndex + 1} of {total}
          </span>
          <div className="flex gap-1">
            {questions.map((_, qIdx) => (
              <span
                key={qIdx}
                className={`w-2 h-2 rounded-full transition-all ${
                  qIdx === currentIndex
                    ? 'bg-[#052B66] scale-125'
                    : qIdx < currentIndex
                    ? 'bg-[#45CC42]'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-bold text-[#101828] leading-snug">
          {currentQ.question}
        </p>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isOptionCorrect = opt.id === currentQ.correctAnswerId;

          let btnStyles = 'bg-white border-gray-200 hover:border-[#052B66] hover:bg-[#F5F7FA]/70 text-gray-800';
          let letterStyles = 'bg-gray-100 text-gray-700';

          if (hasAnswered) {
            if (isOptionCorrect) {
              btnStyles = 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-500/20';
              letterStyles = 'bg-[#45CC42] text-white';
            } else if (isSelected && !isOptionCorrect) {
              btnStyles = 'bg-red-50/80 border-red-400 text-red-950 ring-1 ring-red-400/20';
              letterStyles = 'bg-red-500 text-white';
            } else {
              btnStyles = 'bg-white/50 border-gray-100 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={hasAnswered}
              className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs active:scale-[0.99] cursor-pointer ${btnStyles}`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5 ${letterStyles}`}>
                {hasAnswered && isOptionCorrect ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  opt.id
                )}
              </span>
              <span className="flex-1 leading-relaxed">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Educational Explanation Feedback */}
      {hasAnswered && (
        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className={`p-3 rounded-xl text-xs space-y-1.5 ${
            isCorrect ? 'bg-emerald-50 text-emerald-950 border border-emerald-200' : 'bg-amber-50 text-amber-950 border border-amber-200'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-600" />
                  <span>Not quite right</span>
                </>
              )}
            </div>

            <p className="leading-relaxed text-gray-700">
              {currentQ.explanation}
            </p>

            {currentQ.tip && (
              <div className="pt-1.5 mt-1 border-t border-black/5 flex items-start gap-1 text-[11px] text-gray-600">
                <Lightbulb className="w-3 h-3 text-[#45CC42] shrink-0 mt-0.5" />
                <span><strong>Pro-Tip:</strong> {currentQ.tip}</span>
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#052B66] text-white hover:bg-[#0A4B9F] transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>{currentIndex + 1 < total ? 'Next Question' : 'View Final Results'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#45CC42]" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

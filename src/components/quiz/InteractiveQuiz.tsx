import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Sparkles, 
  Check, 
  Lightbulb, 
  BrainCircuit 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../../types';

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
      // Finished!
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
              {passed ? 'Quiz Completed Successfully! 🎉' : 'Quiz Completed - Review Needed'}
            </h4>
            <p className="text-xs text-gray-500">
              Score: <strong className="text-[#052B66]">{finalScore} of {total} correct ({percentage}%)</strong>
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-[#45CC42]' : 'bg-amber-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {passed
            ? 'Excellent work! You have demonstrated strong recall of Generative AI principles, context windows, and workplace human-in-the-loop governance.'
            : 'Good effort! Review the lesson sections on statistical token generation and data privacy to reinforce key concepts.'}
        </p>

        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-3 bg-[#F5F7FA] hover:bg-gray-200 text-[#052B66] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="ai-interactive-quiz-card" className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 my-2 text-left">
      
      {/* Header & Question Counter */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#45CC42] flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#052B66]">Interactive Check</span>
        </div>
        
        <span className="text-xs font-semibold text-gray-500 bg-[#F5F7FA] px-2 py-0.5 rounded-full border border-gray-200">
          Question {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#45CC42] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <p className="text-xs sm:text-sm font-bold text-[#101828] leading-relaxed">
        {currentQ.question}
      </p>

      {/* Options List (A, B, C, D) */}
      <div className="space-y-2">
        {currentQ.options.map((opt) => {
          const isThisSelected = selectedOption === opt.id;
          const isThisCorrect = opt.id === currentQ.correctAnswerId;
          
          let buttonStyle = 'bg-[#F5F7FA]/70 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white';
          
          if (hasAnswered) {
            if (isThisCorrect) {
              buttonStyle = 'bg-emerald-50/90 border-[#45CC42] text-emerald-900 font-semibold shadow-xs';
            } else if (isThisSelected && !isThisCorrect) {
              buttonStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through opacity-80';
            } else {
              buttonStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={hasAnswered}
              className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all active:scale-[0.99] ${buttonStyle}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                hasAnswered && isThisCorrect
                  ? 'bg-[#45CC42] text-white'
                  : hasAnswered && isThisSelected
                  ? 'bg-rose-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-600'
              }`}>
                {opt.id}
              </div>
              <span className="leading-relaxed flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Panel after Selection */}
      {hasAnswered && (
        <div className={`p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in duration-200 border ${
          isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                <span className="text-emerald-800">✓ Correct Answer!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800">✕ Key Review Point</span>
              </>
            )}
          </div>

          <p className="leading-relaxed text-gray-700">
            {currentQ.explanation}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-[#052B66] hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{currentIndex + 1 < total ? 'Next Question' : 'View Final Score'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

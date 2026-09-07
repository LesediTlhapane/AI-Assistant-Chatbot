import React from 'react';
import { ChevronLeft, ArrowRightCircle, MoreVertical, Bot } from 'lucide-react';
import { Course, LearnerProfile } from '../../types';

interface LmsHeaderProps {
  course: Course;
  learner: LearnerProfile;
  isAiOpen: boolean;
  onToggleAi: () => void;
  onToggleSidebar: () => void;
}

export const LmsHeader: React.FC<LmsHeaderProps> = ({
  course,
  learner,
  isAiOpen,
  onToggleAi,
  onToggleSidebar
}) => {
  return (
    <header id="lms-header" className="sticky top-0 z-30 bg-[#002B66] text-white shadow-md select-none">
      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Navigation Chevron & Module Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Back to course navigation"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 truncate">
            <h1 className="text-sm sm:text-base font-medium tracking-wide text-white truncate">
              Module 5: Module 5: {course.title || 'Creative Thinking and AI'}
            </h1>
          </div>
        </div>

        {/* Center: "PATH" Tab Indicator matching CrossKnowledge LMS */}
        <div className="hidden md:flex items-center justify-center h-full relative">
          <div className="flex flex-col items-center justify-center h-full px-5 bg-white/10 border-b-2 border-[#45CC42] cursor-pointer">
            <div className="w-5 h-5 rounded-full border border-white/80 flex items-center justify-center mb-0.5">
              <ArrowRightCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-white uppercase">PATH</span>
          </div>
        </div>

        {/* Right: Points Circle, Menu, and AI Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* AI Learning Assistant Toggle */}
          <button
            id="btn-header-ai-toggle"
            onClick={onToggleAi}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs border ${
              isAiOpen
                ? 'bg-[#45CC42] text-[#002B66] border-[#45CC42]'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
            }`}
            aria-label={isAiOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Ask eStudy AI</span>
            <span className="w-2 h-2 rounded-full bg-[#45CC42] animate-pulse" />
          </button>

          {/* Points Badge Circle matching Screenshot (e.g. 323) */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#001D47] border-2 border-white/30 shadow-inner text-white">
            <span className="text-xs font-extrabold tracking-tight">323</span>
          </div>

          {/* Overflow Menu Icon */}
          <button className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};

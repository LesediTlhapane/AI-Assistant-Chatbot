import React from 'react';
import { Sparkles, BookOpen, Flame, Bell, CheckCircle2, ChevronRight, Menu, Bot } from 'lucide-react';
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
    <header id="lms-header" className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: LMS & eStudy Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-sidebar-mobile"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:text-[#052B66] hover:bg-gray-100 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-[#052B66]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* eStudy / CrossKnowledge Logo Badge */}
            <div className="flex items-center gap-2 bg-[#052B66] text-white px-2.5 py-1.5 rounded-lg shadow-xs">
              <span className="font-extrabold tracking-tight text-sm text-white">eStudy</span>
              <span className="h-3 w-px bg-white/30"></span>
              <span className="text-[11px] font-medium text-gray-200 tracking-wide">CrossKnowledge</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 pl-2 border-l border-gray-200">
              <span>Courses</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-[#101828] truncate max-w-[200px] xl:max-w-[320px]">
                {course.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Overall Progress Tracker */}
        <div className="hidden sm:flex items-center gap-4 bg-[#F5F7FA] px-3.5 py-1.5 rounded-full border border-gray-200/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#052B66]" />
            <span className="text-xs font-medium text-gray-600">Course Progress:</span>
            <span className="text-xs font-bold text-[#052B66]">{course.totalProgress}%</span>
          </div>
          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#45CC42] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${course.totalProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-[#45CC42]" />
            <span>On Track</span>
          </div>
        </div>

        {/* Right: Learner Info & AI Companion Toggle */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-800 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{learner.streakDays} Day Streak</span>
          </div>

          {/* AI Companion Toggle Button */}
          <button
            id="btn-header-ai-toggle"
            onClick={onToggleAi}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-2xs ${
              isAiOpen
                ? 'bg-[#052B66] text-white border-[#052B66]'
                : 'bg-white text-[#052B66] border-[#052B66]/30 hover:bg-[#052B66]/5'
            }`}
            aria-label={isAiOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          >
            <div className="relative">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#45CC42] rounded-full ring-1 ring-white animate-pulse" />
            </div>
            <span className="hidden sm:inline">AI Learning Assistant</span>
            <span className="sm:hidden font-bold">AI</span>
          </button>

          {/* Learner Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#052B66] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#45CC42]/40">
              {learner.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-[#101828] leading-tight">{learner.name}</p>
              <p className="text-[10px] text-gray-500 leading-tight">Learner</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

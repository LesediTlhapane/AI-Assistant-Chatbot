import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Check, PlayCircle, BookOpen, HelpCircle } from 'lucide-react';
import { Course, Module, Lesson } from '../../types';

interface CourseSidebarProps {
  course: Course;
  activeModuleId: string;
  activeLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  onSelectLesson,
  isOpen,
  onCloseMobile
}) => {
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({
    'module-005': true
  });

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const activeModule = course.modules.find((m) => m.id === activeModuleId) || course.modules[0];

  return (
    <aside
      id="course-sidebar-navigation"
      className={`fixed lg:sticky top-14 z-20 h-[calc(100vh-3.5rem)] w-72 sm:w-80 bg-[#EAEAEA] border-r border-gray-300 flex flex-col transition-all duration-300 ${
        isOpen ? 'left-0' : '-left-full lg:left-0'
      }`}
      aria-label="CrossKnowledge PATH Navigation"
    >
      {/* PATH List Header */}
      <div className="p-3 border-b border-gray-300 bg-[#E0E0E0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#45CC42] fill-emerald-100" />
          <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
            PATH Content
          </span>
        </div>
        <span className="text-[11px] font-semibold text-gray-600 bg-white/60 px-2 py-0.5 rounded">
          {activeModule.lessons.length} steps
        </span>
      </div>

      {/* Accordion List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        
        {/* Module Accordion Header 1 */}
        <div className="rounded-lg bg-[#E0E0E0] border border-gray-300/80 overflow-hidden">
          <button
            onClick={() => toggleModuleExpand('module-005')}
            className="w-full p-2.5 flex items-center justify-between text-left font-bold text-xs text-gray-800 hover:bg-gray-300/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#45CC42] text-white flex items-center justify-center text-[10px] shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="truncate">Module 5: Creative Thinking and AI</span>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
          </button>
        </div>

        {/* Section 2: Data Analytics */}
        <div className="rounded-lg bg-[#E0E0E0] border border-gray-300/80 overflow-hidden">
          <div className="p-2.5 flex items-center justify-between text-xs text-gray-700 font-semibold">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full bg-[#45CC42] text-white flex items-center justify-center text-[10px] shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="truncate">Use AI-Powered Data Analytics for Decision-Making</span>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" />
          </div>
        </div>

        {/* Section 3: Spot and Assess AI Opportunities (Active Group) */}
        <div className="rounded-lg bg-[#E0E0E0] border border-gray-300/80 overflow-hidden">
          <div className="p-2.5 flex items-center justify-between text-xs text-gray-800 font-bold bg-[#D8D8D8]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full border border-blue-600 bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] shrink-0">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              </div>
              <span className="truncate">Spot and Assess AI Opportunities</span>
            </div>
            <ChevronUp className="w-4 h-4 text-gray-700 shrink-0" />
          </div>

          {/* Sub-steps matching exact screenshot styling */}
          <div className="p-1 space-y-1 bg-[#EAEAEA]">
            {activeModule.lessons.map((lesson: Lesson) => {
              const isCurrent = lesson.id === activeLessonId;
              const isDone = lesson.isCompleted;

              if (isCurrent) {
                // Active Item Highlighted in Bright Vibrant Green
                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(activeModule.id, lesson.id)}
                    className="p-2.5 rounded-md bg-[#28B446] text-white flex items-center justify-between gap-2 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold leading-tight truncate text-white">
                          {lesson.title}
                        </h4>
                        <p className="text-[11px] text-white/90 font-medium">
                          Video Faculty | {lesson.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-white shrink-0 text-right">
                      <span className="text-sm font-extrabold block leading-none">{lesson.points || 5}</span>
                      <span className="text-[9px] uppercase tracking-tight opacity-90">PTS</span>
                    </div>
                  </div>
                );
              }

              // Non-active steps
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onSelectLesson(activeModule.id, lesson.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full p-2 rounded-md text-left flex items-center justify-between gap-2 text-xs text-gray-700 hover:bg-gray-300/60 transition-colors"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-[#45CC42] text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-400 bg-white flex items-center justify-center text-[9px] text-gray-500">
                          {lesson.order}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
                        {lesson.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {lesson.type === 'interactive' ? 'Open question' : lesson.type === 'video' ? 'Video' : 'Editorial'} | {lesson.duration}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-gray-500 font-semibold text-[10px]">
                    <span>{lesson.points || 1} {lesson.points === 1 ? 'PT' : 'PTS'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-gray-300 bg-[#E0E0E0] text-[10px] text-gray-600 flex items-center justify-between font-semibold">
        <span>CrossKnowledge PATH</span>
        <span>Module 5</span>
      </div>
    </aside>
  );
};

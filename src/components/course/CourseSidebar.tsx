import React from 'react';
import { CheckCircle2, PlayCircle, BookOpen, Lock, ArrowRight, Sparkles, ChevronDown, ChevronUp, Layers } from 'lucide-react';
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
    [activeModuleId]: true,
    'module-001': false
  });

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <aside
      id="course-sidebar-navigation"
      className={`fixed lg:sticky top-16 z-20 h-[calc(100vh-4rem)] w-72 sm:w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isOpen ? 'left-0' : '-left-full lg:left-0'
      }`}
      aria-label="Course Navigation"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100 bg-[#F5F7FA]/70">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#052B66]" />
            Course Curriculum
          </span>
          <span className="text-xs font-semibold text-[#052B66] bg-white px-2 py-0.5 rounded-full border border-gray-200">
            {course.modules.length} Modules
          </span>
        </div>
        <h2 className="text-sm font-bold text-[#101828] leading-tight line-clamp-1">{course.title}</h2>
        
        {/* Module progress indicator */}
        <div className="mt-3 pt-2.5 border-t border-gray-200/70">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Module 2 Progress</span>
            <span className="font-bold text-[#052B66]">78%</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#45CC42] h-full rounded-full w-[78%] transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {course.modules.map((mod: Module) => {
          const isCurrentModule = mod.id === activeModuleId;
          const isExpanded = expandedModules[mod.id] ?? isCurrentModule;
          const isLocked = mod.status === 'locked';
          const isCompleted = mod.status === 'completed';

          return (
            <div
              key={mod.id}
              id={`nav-module-${mod.id}`}
              className={`rounded-xl border transition-all ${
                isCurrentModule
                  ? 'border-[#052B66]/30 bg-white shadow-xs ring-1 ring-[#052B66]/10'
                  : isCompleted
                  ? 'border-gray-200 bg-[#F5F7FA]/40'
                  : 'border-gray-200 bg-white opacity-70'
              }`}
            >
              {/* Module Header Button */}
              <button
                onClick={() => !isLocked && toggleModuleExpand(mod.id)}
                disabled={isLocked}
                className="w-full p-3 flex items-start justify-between text-left gap-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#052B66]"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#45CC42] flex items-center justify-center border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-[#45CC42]" />
                      </div>
                    ) : isCurrentModule ? (
                      <div className="w-5 h-5 rounded-full bg-[#052B66] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                        {mod.order}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-medium border border-gray-200">
                        {isLocked ? <Lock className="w-3 h-3 text-gray-400" /> : mod.order}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                        Module {mod.order}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm">
                          Completed
                        </span>
                      )}
                      {isCurrentModule && (
                        <span className="text-[10px] font-bold text-[#052B66] bg-[#052B66]/10 px-1.5 py-0.2 rounded-sm">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xs font-bold truncate mt-0.5 ${isCurrentModule ? 'text-[#052B66]' : 'text-gray-800'}`}>
                      {mod.title}
                    </h3>
                  </div>
                </div>

                {!isLocked && (
                  <div className="text-gray-400 hover:text-gray-600 mt-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                )}
              </button>

              {/* Module Lessons Sub-list */}
              {isExpanded && !isLocked && (
                <div className="px-2 pb-2.5 pt-1 border-t border-gray-100 space-y-1">
                  {mod.lessons.map((lesson: Lesson) => {
                    const isCurrentLesson = lesson.id === activeLessonId;
                    return (
                      <button
                        key={lesson.id}
                        id={`nav-lesson-${lesson.id}`}
                        onClick={() => {
                          onSelectLesson(mod.id, lesson.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between text-xs transition-all ${
                          isCurrentLesson
                            ? 'bg-[#052B66] text-white font-semibold shadow-xs'
                            : 'text-gray-700 hover:bg-gray-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {lesson.type === 'video' ? (
                            <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isCurrentLesson ? 'text-[#45CC42]' : 'text-gray-400'}`} />
                          ) : (
                            <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isCurrentLesson ? 'text-white' : 'text-gray-400'}`} />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className={`text-[10px] shrink-0 font-medium ${isCurrentLesson ? 'text-white/80' : 'text-gray-400'}`}>
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: CrossKnowledge Context */}
      <div className="p-3 border-t border-gray-200 bg-[#F5F7FA] text-[11px] text-gray-500 flex items-center justify-between">
        <span>eStudy Corporate LMS</span>
        <span className="font-semibold text-gray-700">v3.4 (Cloud)</span>
      </div>
    </aside>
  );
};

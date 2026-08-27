import React, { useState } from 'react';
import { 
  Course, 
  LearnerProfile, 
  ChatMessage, 
  Module, 
  Lesson 
} from '../../types';
import { LmsHeader } from './LmsHeader';
import { CourseSidebar } from '../course/CourseSidebar';
import { CourseContentView } from '../course/CourseContentView';
import { AiAssistantPanel } from '../assistant/AiAssistantPanel';
import { CollapsedAiButton } from '../assistant/CollapsedAiButton';
import { X, Sparkles, Bot } from 'lucide-react';

interface LmsLayoutProps {
  course: Course;
  learner: LearnerProfile;
  activeModule: Module;
  activeLesson: Lesson;
  messages: ChatMessage[];
  isThinking: boolean;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onSendMessage: (query: string, actionType?: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general') => void;
  onResetConversation: () => void;
  onNextLesson: () => void;
  onPrevLesson: () => void;
}

export const LmsLayout: React.FC<LmsLayoutProps> = ({
  course,
  learner,
  activeModule,
  activeLesson,
  messages,
  isThinking,
  onSelectLesson,
  onSendMessage,
  onResetConversation,
  onNextLesson,
  onPrevLesson
}) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isAiOpenDesktop, setIsAiOpenDesktop] = useState(true);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [isAiOpenMobile, setIsAiOpenMobile] = useState(false);

  const toggleAi = () => {
    setIsAiOpenDesktop((prev) => !prev);
    setIsAiOpenMobile((prev) => !prev);
  };

  return (
    <div id="eStudy-lms-container" className="min-h-screen bg-[#F5F7FA] text-[#101828] flex flex-col font-sans antialiased">
      
      {/* 1. LMS Sticky Navigation Header */}
      <LmsHeader
        course={course}
        learner={learner}
        isAiOpen={isAiOpenDesktop || isAiOpenMobile}
        onToggleAi={toggleAi}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
      />

      {/* 2. Primary 3-Column LMS Layout */}
      <div className="flex-1 flex overflow-hidden relative max-w-[1920px] mx-auto w-full">
        
        {/* Left: Course Navigation Sidebar */}
        <CourseSidebar
          course={course}
          activeModuleId={activeModule.id}
          activeLessonId={activeLesson.id}
          onSelectLesson={onSelectLesson}
          isOpen={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Backdrop for Mobile Sidebar */}
        {isSidebarOpenMobile && (
          <div
            onClick={() => setIsSidebarOpenMobile(false)}
            className="fixed inset-0 z-10 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Center: Course Learning Content (Main Viewport) */}
        <div className={`flex-1 flex flex-col overflow-y-auto bg-white min-w-0 transition-all duration-300 ${
          isAiOpenDesktop ? 'lg:mr-0' : ''
        }`}>
          <CourseContentView
            course={course}
            activeModule={activeModule}
            activeLesson={activeLesson}
            onAskAiAboutTopic={(topic, type) => {
              // Ensure AI is open
              setIsAiOpenDesktop(true);
              setIsAiOpenMobile(true);
              onSendMessage(topic, type || 'explain');
            }}
            onNextLesson={onNextLesson}
            onPrevLesson={onPrevLesson}
          />
        </div>

        {/* Right: Embedded AI Learning Assistant (Desktop / Tablet) */}
        <div
          className={`hidden lg:block h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ease-in-out shrink-0 ${
            isAiOpenDesktop
              ? isAiExpanded
                ? 'w-[560px] xl:w-[640px] opacity-100'
                : 'w-[360px] xl:w-[400px] opacity-100'
              : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          {isAiOpenDesktop && (
            <AiAssistantPanel
              learner={learner}
              module={activeModule}
              lesson={activeLesson}
              messages={messages}
              isThinking={isThinking}
              onSendMessage={onSendMessage}
              onCollapse={() => setIsAiOpenDesktop(false)}
              onResetConversation={onResetConversation}
              isExpanded={isAiExpanded}
              onToggleExpand={() => setIsAiExpanded(!isAiExpanded)}
            />
          )}
        </div>

        {/* Collapsed "Ask AI" Trigger button on desktop */}
        {!isAiOpenDesktop && (
          <CollapsedAiButton onClick={() => setIsAiOpenDesktop(true)} />
        )}

      </div>

      {/* 3. Mobile AI Assistant Bottom Sheet / Modal View */}
      {isAiOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[90vh] h-[85vh] w-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border-t border-gray-200">
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2.5 shrink-0" />
            
            <div className="flex-1 overflow-hidden flex flex-col">
              <AiAssistantPanel
                learner={learner}
                module={activeModule}
                lesson={activeLesson}
                messages={messages}
                isThinking={isThinking}
                onSendMessage={onSendMessage}
                onCollapse={() => setIsAiOpenMobile(false)}
                onResetConversation={onResetConversation}
                isMobileDrawer={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile when AI is closed */}
      {!isAiOpenMobile && (
        <button
          onClick={() => setIsAiOpenMobile(true)}
          className="lg:hidden fixed bottom-5 right-5 z-30 bg-[#052B66] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#45CC42] active:scale-95 transition-transform"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-bold pr-1">Ask AI</span>
        </button>
      )}

    </div>
  );
};

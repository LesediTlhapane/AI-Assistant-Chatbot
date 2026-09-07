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
import { Bot } from 'lucide-react';

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
  const [isAiOpenDesktop, setIsAiOpenDesktop] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [isAiOpenMobile, setIsAiOpenMobile] = useState(false);

  const toggleAi = () => {
    setIsAiOpenDesktop((prev) => !prev);
    setIsAiOpenMobile((prev) => !prev);
  };

  return (
    <div id="eStudy-lms-container" className="h-screen bg-white text-[#101828] flex flex-col font-sans antialiased overflow-hidden">
      
      {/* 1. CrossKnowledge Dark Navy Header */}
      <LmsHeader
        course={course}
        learner={learner}
        isAiOpen={isAiOpenDesktop || isAiOpenMobile}
        onToggleAi={toggleAi}
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
      />

      {/* 2. Seamless Attached 3-Column Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100vh-3.5rem)]">
        
        {/* Left Widget: Module Navigation Sidebar (Attached to Middle) */}
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
            className="fixed inset-0 z-10 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Middle Widget: Course Learning Content (Attached to Left & Right) */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white min-w-0 border-r border-gray-200">
          <CourseContentView
            course={course}
            activeModule={activeModule}
            activeLesson={activeLesson}
            onAskAiAboutTopic={(topic, type) => {
              setIsAiOpenDesktop(true);
              setIsAiOpenMobile(true);
              onSendMessage(topic, type || 'explain');
            }}
            onNextLesson={onNextLesson}
            onPrevLesson={onPrevLesson}
          />
        </div>

        {/* Right Widget: AI Learning Assistant Panel (Attached to Middle) */}
        <div
          className={`hidden lg:block h-full transition-all duration-300 ease-in-out shrink-0 border-l border-gray-200 bg-white ${
            isAiOpenDesktop
              ? isAiExpanded
                ? 'w-[520px] xl:w-[600px] opacity-100'
                : 'w-[360px] xl:w-[390px] opacity-100'
              : 'w-0 opacity-0 overflow-hidden border-none'
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
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
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
          className="lg:hidden fixed bottom-5 right-5 z-30 bg-[#002B66] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#45CC42] active:scale-95 transition-transform"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-bold pr-1">Ask eStudy AI</span>
        </button>
      )}

    </div>
  );
};

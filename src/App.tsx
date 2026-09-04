import React, { useState, useEffect } from 'react';
import { mockCourseData } from './data/mockCourseData';
import { mockLearner } from './data/mockLearnerData';
import { Course, LearnerProfile, ChatMessage, Module, Lesson } from './types';
import { LmsLayout } from './components/layout/LmsLayout';
import { AiService } from './services/aiService';
import { EmbedApp } from './EmbedApp';

export default function App() {
  // 1. Check if running in iframe / embed route mode
  const isEmbedMode = window.location.pathname.includes('/embed') || window.location.search.includes('mode=embed');

  if (isEmbedMode) {
    return <EmbedApp />;
  }

  // 2. Demo LMS State
  const [course, setCourse] = useState<Course>(mockCourseData);
  const [learner, setLearner] = useState<LearnerProfile>(mockLearner);
  const [activeModuleId, setActiveModuleId] = useState<string>(course.currentModuleId);
  const [activeLessonId, setActiveLessonId] = useState<string>(course.currentLessonId);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Chat messages — start fresh so the conversation is always scoped to the current lesson
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Derive active module & lesson
  const activeModule = course.modules.find((m) => m.id === activeModuleId) || course.modules[1];
  const activeLesson = activeModule.lessons.find((l) => l.id === activeLessonId) || activeModule.lessons[0];

  // Handle module/lesson navigation — start a fresh conversation for each new topic
  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);

    const targetLesson = course.modules.find((m) => m.id === moduleId)?.lessons.find((l) => l.id === lessonId);

    // Clear the conversation when switching to a different lesson
    // so the user starts fresh on the new topic
    if (targetLesson && targetLesson.id !== activeLessonId) {
      setMessages([]);
    }
  };

  // Next lesson navigation
  const handleNextLesson = () => {
    const currentModuleIndex = course.modules.findIndex((m) => m.id === activeModuleId);
    const currentLessonIndex = activeModule.lessons.findIndex((l) => l.id === activeLessonId);

    if (currentLessonIndex + 1 < activeModule.lessons.length) {
      const nextLesson = activeModule.lessons[currentLessonIndex + 1];
      handleSelectLesson(activeModule.id, nextLesson.id);
    } else if (currentModuleIndex + 1 < course.modules.length) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.status !== 'locked' && nextModule.lessons.length > 0) {
        handleSelectLesson(nextModule.id, nextModule.lessons[0].id);
      }
    }
  };

  // Previous lesson navigation
  const handlePrevLesson = () => {
    const currentModuleIndex = course.modules.findIndex((m) => m.id === activeModuleId);
    const currentLessonIndex = activeModule.lessons.findIndex((l) => l.id === activeLessonId);

    if (currentLessonIndex > 0) {
      const prevLesson = activeModule.lessons[currentLessonIndex - 1];
      handleSelectLesson(activeModule.id, prevLesson.id);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        handleSelectLesson(prevModule.id, prevModule.lessons[prevModule.lessons.length - 1].id);
      }
    }
  };

  // Handle sending a message / triggering an AI action via Gemini 2.5 Flash API
  const handleSendMessage = async (
    query: string,
    actionType: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general' = 'general'
  ) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const lmsContext = AiService.buildContextFromLesson(activeLesson, activeModule, learner.id);
      const responseMsg = await AiService.sendMessage({
        message: query,
        actionType,
        context: lmsContext,
        conversationHistory: messages
      });

      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'Something went wrong while connecting to the AI learning assistant. Please try again.',
          isError: true,
          suggestions: ['Retry question', 'Explain this lesson']
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Reset conversation to fresh state
  const handleResetConversation = () => {
    setMessages([]);
  };

  return (
    <LmsLayout
      course={course}
      learner={learner}
      activeModule={activeModule}
      activeLesson={activeLesson}
      messages={messages}
      isThinking={isThinking}
      onSelectLesson={handleSelectLesson}
      onSendMessage={handleSendMessage}
      onResetConversation={handleResetConversation}
      onNextLesson={handleNextLesson}
      onPrevLesson={handlePrevLesson}
    />
  );
}

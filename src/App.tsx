// React's type declarations are not currently available in the project.
// Keep the runtime import working while the dependency is added.
// @ts-expect-error React is currently untyped in this project.
import React, { useState } from 'react';
import { mockCourseData } from './data/mockCourseData';
import { mockLearner } from './data/mockLearnerData';
import { Course, LearnerProfile, ChatMessage, Module, Lesson } from './types';
import { LmsLayout } from './components/layout/LmsLayout';
import { AiSimulatorService } from './services/aiSimulator';

export default function App() {
  const [course, setCourse] = useState<Course>(mockCourseData);
  const [learner, setLearner] = useState<LearnerProfile>(mockLearner);
  const [activeModuleId, setActiveModuleId] = useState<string>(course.currentModuleId);
  const [activeLessonId, setActiveLessonId] = useState<string>(course.currentLessonId);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Initial pre-seeded conversation showcasing the exact prompt interaction
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-seed-1',
      sender: 'user',
      timestamp: '09:41 AM',
      content: 'What is generative AI?'
    },
    {
      id: 'msg-seed-2',
      sender: 'assistant',
      timestamp: '09:41 AM',
      content: '### Understanding Generative AI 🤖\n\n**Generative AI** refers to AI systems that can create new content such as text, images, audio, code, or other forms of media based on patterns learned from existing data.\n\nIn this lesson, the important idea is that **generative AI doesn\'t simply retrieve information — it generates a response based on the context of your request.**\n\n- **Pattern Recognition & Synthesis:** Predicts high-probability tokens within a context window.\n- **Human-in-the-Loop:** Acts as an executive co-pilot rather than an unverified replacement.',
      actionType: 'explain',
      contextLessonId: 'lesson-002-01',
      contextLessonTitle: 'Introduction to Generative AI',
      suggestions: [
        'Give me an example',
        'Simplify this',
        'Test my knowledge'
      ]
    }
  ]);

  // Derive active module & lesson
  const activeModule = course.modules.find((m: { id: any; }) => m.id === activeModuleId) || course.modules[1];
  const activeLesson = activeModule.lessons.find((l) => l.id === activeLessonId) || activeModule.lessons[0];

  // Handle module/lesson navigation
  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);

    const targetModule = course.modules.find((m) => m.id === moduleId);
    const targetLesson = targetModule?.lessons.find((l) => l.id === lessonId);

    if (targetLesson && targetLesson.id !== activeLessonId) {
      // Add a subtle system notification in chat that AI context updated
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ctx-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `🔄 **Context Synced:** Now viewing **Module ${targetModule?.order}: ${targetLesson.title}**.\n\nFeel free to ask me to explain concepts, simplify topics, or test your knowledge for this lesson!`,
          contextLessonId: targetLesson.id,
          contextLessonTitle: targetLesson.title,
          suggestions: ['Explain this lesson', 'Give me an example', 'Test my knowledge']
        }
      ]);
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

  // Handle sending a message / triggering an AI action
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
      const result = await AiSimulatorService.generateResponse(query, actionType, activeLesson);
      setMessages((prev) => [...prev, result.message]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'Something went wrong while connecting to the lesson context. Please try again.',
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
    React.createElement(LmsLayout, {
      course,
      learner,
      activeModule,
      activeLesson,
      messages,
      isThinking,
      onSelectLesson: handleSelectLesson,
      onSendMessage: handleSendMessage,
      onResetConversation: handleResetConversation,
      onNextLesson: handleNextLesson,
      onPrevLesson: handlePrevLesson
    })
  );
}

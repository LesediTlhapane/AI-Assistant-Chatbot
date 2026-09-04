import React, { useState, useEffect } from 'react';
import { ChatMessage, Lesson, Module, LearnerProfile } from './types';
import { AiAssistantPanel } from './components/assistant/AiAssistantPanel';
import { AiService } from './services/aiService';
import { CrossKnowledgeContext, CrossKnowledgeService } from './services/crossKnowledgeService';

export const EmbedApp: React.FC = () => {
  const [context, setContext] = useState<CrossKnowledgeContext>({
    courseId: 'course-estudy-ai',
    courseName: 'eStudy Learning Program',
    moduleId: 'mod-1',
    moduleName: 'Generative AI Foundations',
    lessonId: 'lesson-002-01',
    lessonTitle: 'Introduction to Generative AI',
    lessonContent: 'Generative AI refers to AI systems that create text, images, and content based on learned context patterns.',
    learnerId: 'learner-001',
    learnerName: 'Learner'
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Derived mock Lesson & Module objects for UI compatibility
  const activeLesson: Lesson = {
    id: context.lessonId || 'lesson-001',
    order: 1,
    title: context.lessonTitle || 'Current Lesson',
    duration: '15 mins',
    type: 'reading',
    description: typeof context.lessonContent === 'string' ? context.lessonContent.slice(0, 200) : '',
    learningObjectives: ['Understand current topic concepts'],
    contentSections: [
      {
        title: context.lessonTitle || 'Lesson Overview',
        body: [typeof context.lessonContent === 'string' ? context.lessonContent : 'Lesson material active.']
      }
    ],
    practicalTakeaway: 'Apply key concepts in your daily workflow.'
  };

  const activeModule: Module = {
    id: context.moduleId || 'mod-001',
    order: 1,
    title: context.moduleName || 'Current Module',
    description: 'Active learning module',
    status: 'in-progress',
    progress: 50,
    estimatedTime: '45 mins',
    lessons: [activeLesson]
  };

  const learner: LearnerProfile = {
    id: context.learnerId || 'learner-001',
    name: context.learnerName || 'Learner',
    role: context.learnerRole || 'Student',
    organization: context.organization || 'eStudy South Africa',
    courseProgress: 45,
    streakDays: 3,
    quizzesCompleted: 4,
    challengesCompleted: 2
  };

  // Secure postMessage event listener for CrossKnowledge parent frame
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Validate origin if allowed origins are specified in window config
      const allowedOrigins = (window as any).ESTUDY_ALLOWED_ORIGINS || [];
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(event.origin) && !event.origin.includes('localhost')) {
        console.warn(`[eStudy AI Embed] Discarded message from unapproved origin: ${event.origin}`);
        return;
      }

      if (event.data && event.data.type === 'ESTUDY_CONTEXT' && event.data.payload) {
        const normalized = CrossKnowledgeService.normalizeContext(event.data.payload);
        setContext(normalized);

        // Add a notification message that context was synced from host LMS
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-sync-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `🔄 **LMS Context Updated:** Viewing **${normalized.lessonTitle}** (${normalized.moduleName}).\n\nHow can I help you understand this lesson?`,
            contextLessonId: normalized.lessonId,
            contextLessonTitle: normalized.lessonTitle,
            suggestions: ['Explain this lesson', 'Give me an example', 'Summarise this lesson']
          }
        ]);
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []);

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
      const responseMsg = await AiService.sendMessage({
        message: query,
        actionType,
        context,
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
          content: 'Sorry, I ran into an issue connecting to the AI service. Please try again.',
          isError: true,
          suggestions: ['Retry question', 'Explain this lesson']
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
  };

  return (
    <div id="estudy-ai-embed-root" className="w-full h-screen bg-white overflow-hidden flex flex-col font-sans">
      <AiAssistantPanel
        learner={learner}
        module={activeModule}
        lesson={activeLesson}
        messages={messages}
        isThinking={isThinking}
        onSendMessage={handleSendMessage}
        onCollapse={() => {
          // Notify parent frame to close drawer if running inside iframe
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'ESTUDY_CLOSE_WIDGET' }, '*');
          }
        }}
        onResetConversation={handleResetConversation}
      />
    </div>
  );
};

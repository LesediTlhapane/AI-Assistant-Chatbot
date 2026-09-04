import { ChatMessage, Lesson, Module } from '../types';
import { CrossKnowledgeContext } from './crossKnowledgeService';

export interface ChatApiRequest {
  message: string;
  actionType?: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general';
  context?: CrossKnowledgeContext;
  conversationHistory?: ChatMessage[];
}

export interface ChatApiResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export class AiService {
  private static API_URL_ENDPOINTS = [
    import.meta.env.VITE_API_URL || '/api/chat',
    'http://localhost:3001/api/chat',
    'http://localhost:3002/api/chat',
    'http://localhost:3003/api/chat'
  ];

  /**
   * Sends a user message and lesson context to the backend Gemini API endpoint
   */
  static async sendMessage(request: ChatApiRequest): Promise<ChatMessage> {
    let lastNetworkError: any = null;

    const payload = JSON.stringify({
      message: request.message,
      actionType: request.actionType || 'general',
      context: request.context,
      conversationHistory: (request.conversationHistory || []).map((m) => ({
        sender: m.sender,
        content: m.content
      }))
    });

    for (const endpoint of this.API_URL_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload
        });

        const data: ChatApiResponse = await response.json();

        if (!response.ok || !data.success || !data.message) {
          const errorMsg = data.error || `Server responded with status ${response.status}`;
          return {
            id: `msg-err-${Date.now()}`,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `⚠️ **AI Assistant Notice:** ${errorMsg}`,
            isError: true,
            suggestions: ['Retry question', 'Explain this lesson']
          };
        }

        return data.message;
      } catch (err: any) {
        lastNetworkError = err;
        // Try next endpoint fallback in list
      }
    }

    console.error('[AiService Error]: All endpoint attempts failed.', lastNetworkError);
    return {
      id: `msg-network-err-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '⚠️ **Backend Server Offline:** Unable to reach the eStudy AI Assistant server.\n\nPlease start the backend server by running:\n```bash\nnpm run dev:server\n```',
      isError: true,
      suggestions: ['Retry question', 'Explain this lesson']
    };
  }

  /**
   * Helper to format a Lesson + Module into a CrossKnowledgeContext payload
   */
  static buildContextFromLesson(lesson?: Lesson, module?: Module, learnerId?: string): CrossKnowledgeContext {
    if (!lesson) {
      return {
        courseId: 'course-general',
        courseName: 'eStudy Vocational Learning',
        learnerId: learnerId || 'learner-anon'
      };
    }

    const lessonText = lesson.contentSections
      ? lesson.contentSections.map((s) => `${s.title}: ${s.body.join(' ')}`).join('\n')
      : lesson.description;

    return {
      courseId: 'course-estudy-ai',
      courseName: 'eStudy AI Learning Program',
      moduleId: module?.id || 'mod-active',
      moduleName: module?.title || 'Active Module',
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonContent: lessonText,
      learnerId: learnerId || 'learner-anon'
    };
  }
}

import { 
  ChatMessage, 
  Lesson, 
  Module, 
  QuizQuestion, 
  ChallengeScenario, 
  ChallengeEvaluation 
} from '../types';
import { AssistantContext, QuickActionType } from '../types/assistant';
import { CrossKnowledgeContext } from './crossKnowledgeService';
import { AiSimulatorService } from './aiSimulator';

export interface ChatApiRequest {
  message: string;
  actionType?: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general';
  context?: CrossKnowledgeContext | AssistantContext;
  conversationHistory?: ChatMessage[];
}

export interface ChatApiResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
  groqConfigured?: boolean;
}

interface ChatApiQuizResponse extends ChatApiResponse {
  quizData?: {
    questions: QuizQuestion[];
  };
}

export class AiService {
  private static API_URL_ENDPOINTS = [
    '/api/chat',
    import.meta.env.VITE_API_URL || '',
    ...(import.meta.env.DEV
      ? ['http://localhost:3000/api/chat', 'http://localhost:3001/api/chat']
      : [])
  ].filter(Boolean);

  /**
   * Primary call to the backend Groq-powered API
   */
  static async sendMessage(request: ChatApiRequest): Promise<ChatMessage> {
    const payload = JSON.stringify({
      message: request.message,
      actionType: request.actionType || 'general',
      context: request.context,
      conversationHistory: (request.conversationHistory || []).map((m) => ({
        sender: m.sender,
        content: m.content
      }))
    });

    let lastError = 'No AI API endpoint is configured.';
    for (const endpoint of this.API_URL_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload
        });

        const data: ChatApiQuizResponse = await response.json();
        if (response.ok && data.success && data.message) {
          if (data.quizData && !data.message.quizData) {
            data.message.quizData = {
              questions: data.quizData.questions,
              currentQuestionIndex: 0,
              userAnswers: {},
              isSubmitted: false
            };
          }
          return data.message;
        }
        lastError = data.error || `AI service request failed with status ${response.status}.`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    throw new Error(`Unable to get a knowledge-based AI response: ${lastError}`);
  }

  /**
   * Helper to format a Lesson + Module into a CrossKnowledgeContext payload
   */
  static buildContextFromLesson(lesson?: Lesson, module?: Module, learnerId?: string): CrossKnowledgeContext {
    if (!lesson) {
      return {
        learnerId
      };
    }

    const lessonText = lesson.contentSections
      ? lesson.contentSections.map((s) => `${s.title}: ${s.body.join(' ')}`).join('\n')
      : lesson.description;

    return {
      moduleId: module?.id,
      moduleName: module?.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonContent: lessonText,
      learnerId
    };
  }
}

/**
 * Default instance exporting for AiAssistantPanel and PracticalChallenge components
 */
export const aiService = {
  async sendMessage(
    query: string,
    context: AssistantContext,
    actionType: QuickActionType = 'general',
    history: ChatMessage[] = []
  ): Promise<ChatMessage> {
    return AiService.sendMessage({
      message: query,
      actionType,
      context,
      conversationHistory: history
    });
  },

  async evaluateChallenge(
    submission: string,
    scenario: ChallengeScenario,
    _context?: AssistantContext
  ): Promise<ChallengeEvaluation> {
    // Evaluate workplace challenge
    return AiSimulatorService.evaluateChallenge(submission, scenario as any);
  }
};

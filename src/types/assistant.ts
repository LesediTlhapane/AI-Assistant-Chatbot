/**
 * eStudy AI Assistant - TypeScript Types & Interfaces
 * Clean integration boundary for CrossKnowledge LMS and future Gemini Flash + RAG backend
 */

export type QuickActionType =
  | 'explain'
  | 'simplify'
  | 'example'
  | 'summarise'
  | 'quiz'
  | 'challenge'
  | 'general';

export type AssistantMode = 'welcome' | 'conversation' | 'quiz' | 'challenge' | 'error';

export interface AssistantContext {
  courseId?: string;
  courseName?: string;
  courseTitle?: string;
  moduleId?: string;
  moduleName?: string;
  moduleOrder?: number | string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonDescription?: string;
  lessonContent?: string | object;
  learnerId?: string;
  learnerName?: string;
  courseProgress?: number;
  moduleProgress?: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswerId: string;
  explanation: string;
  tip?: string;
}

export interface ChallengeScenario {
  id: string;
  title: string;
  scenario: string;
  promptQuestion: string;
  keyConsiderations: string[];
  sampleGoodAspects?: string[];
}

export interface ChallengeEvaluation {
  score: number; // 0 - 100
  strengths: string[];
  areasToImprove: string[];
  expertFeedback: string;
  recommendedNextStep?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  role?: 'learner' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  actionType?: QuickActionType;
  contextLessonId?: string;
  contextLessonTitle?: string;
  suggestions?: string[];
  actions?: string[];
  quizData?: {
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    userAnswers: Record<string, string>;
    isSubmitted: boolean;
    score?: number;
  };
  challengeData?: {
    scenario: ChallengeScenario;
    userSubmission?: string;
    evaluation?: ChallengeEvaluation;
    isEvaluating?: boolean;
  };
  isError?: boolean;
}

/**
 * Service abstraction interface for AI communication.
 * In development, implemented by simulated local AI.
 * In production, will proxy to Google Gemini Flash + RAG knowledge retrieval backend.
 */
export interface AIService {
  sendMessage(
    query: string,
    context: AssistantContext,
    actionType?: QuickActionType,
    history?: ChatMessage[]
  ): Promise<ChatMessage>;
  
  evaluateChallenge?(
    submission: string,
    scenario: ChallengeScenario,
    context: AssistantContext
  ): Promise<ChallengeEvaluation>;
}

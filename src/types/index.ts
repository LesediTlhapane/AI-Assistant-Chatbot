export type ModuleStatus = 'completed' | 'in-progress' | 'locked';

export interface Lesson {
  id: string;
  order: number;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'interactive' | 'assessment';
  description: string;
  videoDuration?: string;
  points?: number;
  isCompleted?: boolean;
  learningObjectives: string[];
  contentSections: {
    title: string;
    body: string[];
    highlightQuote?: string;
    keyConcept?: {
      term: string;
      definition: string;
      example: string;
    };
  }[];
  practicalTakeaway: string;
}

export interface Module {
  id: string;
  order: number;
  title: string;
  description: string;
  status: ModuleStatus;
  progress: number;
  estimatedTime: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  provider: string;
  category: string;
  totalProgress: number;
  currentModuleId: string;
  currentLessonId: string;
  modules: Module[];
}

export interface LearnerProfile {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl?: string;
  courseProgress: number;
  streakDays: number;
  quizzesCompleted: number;
  challengesCompleted: number;
}

export type AssistantMode = 'welcome' | 'conversation' | 'quiz' | 'challenge' | 'error';

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
  tip: string;
}

export interface ChallengeScenario {
  id: string;
  title: string;
  scenario: string;
  promptQuestion: string;
  keyConsiderations: string[];
  sampleGoodAspects: string[];
}

export interface ChallengeEvaluation {
  score: number; // 0 - 100
  strengths: string[];
  areasToImprove: string[];
  expertFeedback: string;
  recommendedNextStep: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  actionType?: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general';
  contextLessonId?: string;
  contextLessonTitle?: string;
  suggestions?: string[];
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

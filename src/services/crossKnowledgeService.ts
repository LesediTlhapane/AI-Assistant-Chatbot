/**
 * CrossKnowledge LMS Integration Service Interface
 * Handles learner context mapping and API authentication with CrossKnowledge host platform.
 */

export interface CrossKnowledgeContext {
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonContent?: string | object;
  learnerId?: string;
  learnerName?: string;
  learnerRole?: string;
  organization?: string;
}

export interface CrossKnowledgeConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export class CrossKnowledgeService {
  private static config: CrossKnowledgeConfig = {
    baseUrl: import.meta.env.VITE_CROSSKNOWLEDGE_BASE_URL || 'https://estudy.crossknowledge.com',
    clientId: import.meta.env.VITE_CROSSKNOWLEDGE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_CROSSKNOWLEDGE_CLIENT_SECRET || ''
  };

  /**
   * Sanitizes and normalizes learner context received from CrossKnowledge LMS
   */
  static normalizeContext(rawContext: Partial<CrossKnowledgeContext>): CrossKnowledgeContext {
    return {
      courseId: rawContext.courseId || 'course-default',
      courseName: rawContext.courseName || 'eStudy South Africa Course',
      moduleId: rawContext.moduleId || 'mod-default',
      moduleName: rawContext.moduleName || 'Current Module',
      lessonId: rawContext.lessonId || 'lesson-default',
      lessonTitle: rawContext.lessonTitle || 'Current Lesson',
      lessonContent: typeof rawContext.lessonContent === 'string' 
        ? rawContext.lessonContent 
        : JSON.stringify(rawContext.lessonContent || ''),
      learnerId: rawContext.learnerId || 'learner-anon',
      learnerName: rawContext.learnerName || 'Learner',
      learnerRole: rawContext.learnerRole || 'Student',
      organization: rawContext.organization || 'eStudy South Africa'
    };
  }

  /**
   * Stub method for future server-to-server CrossKnowledge OAuth / API authentication.
   * Documented requirements:
   * 1. OAuth2 Client Credentials grant flow endpoint: POST /oauth/v2/token
   * 2. Learner progress API endpoint: GET /api/v1/learners/{learnerId}/courses/{courseId}
   * 3. Lesson content API endpoint: GET /api/v1/courses/{courseId}/lessons/{lessonId}
   */
  static isApiConfigured(): boolean {
    return Boolean(this.config.clientId && this.config.clientSecret);
  }

  static getApiRequirements(): string[] {
    return [
      'CROSSKNOWLEDGE_BASE_URL: Base URL of CrossKnowledge tenant instance',
      'CROSSKNOWLEDGE_CLIENT_ID: OAuth2 Client ID provided by CrossKnowledge admin',
      'CROSSKNOWLEDGE_CLIENT_SECRET: OAuth2 Client Secret',
      'LMS JavaScript Hook or postMessage bridge enabled on CrossKnowledge course player template'
    ];
  }
}

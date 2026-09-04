import { ChatMessage, ChallengeEvaluation, Lesson } from '../types';
import { lessonQuizzes, lessonChallenges } from '../data/mockQuizChallenges';

export interface AiResponseResult {
  message: ChatMessage;
  state?: 'conversation' | 'quiz' | 'challenge';
}

export class AiSimulatorService {
  private static getLessonContextSummary(lesson: Lesson): string {
    const objectiveText = lesson.learningObjectives && lesson.learningObjectives.length > 0
      ? lesson.learningObjectives.join('; ')
      : 'understand the key idea of the lesson';

    const contentText = lesson.contentSections && lesson.contentSections.length > 0
      ? lesson.contentSections.map((section) => section.body.join(' ')).join(' ')
      : lesson.description;

    return `${lesson.title}. ${lesson.description}. Key focus: ${objectiveText}. Context: ${contentText}`;
  }

  private static getLessonTheme(lesson: Lesson): string {
    const cleanedTitle = lesson.title.replace(/^Welcome to:\s*/i, '').trim();
    return cleanedTitle || lesson.description || 'this lesson';
  }

  /**
   * Generates initial welcome message for learner
   */
  static getWelcomeMessage(learnerName: string = 'John', lesson: Lesson): ChatMessage {
    return {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hi ${learnerName} 👋\n\nI'm here to help you understand the material, practise what you've learned, and prepare for your assessments for **${lesson.title}**.\n\nWhat would you like to do?`,
      suggestions: [
        'Explain this lesson',
        'Simplify',
        'Give me an example',
        'Test my knowledge',
        'Practical challenge'
      ]
    };
  }

  /**
   * Generates a context-aware AI response based on action type or user query
   */
  static async generateResponse(
    query: string,
    actionType: 'explain' | 'simplify' | 'example' | 'summarise' | 'quiz' | 'challenge' | 'general',
    lesson: Lesson
  ): Promise<AiResponseResult> {
    // Simulate slight natural latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const normalizedQuery = query.toLowerCase().trim();

    // 1. Quiz Mode Trigger
    if (actionType === 'quiz' || normalizedQuery.includes('quiz') || normalizedQuery.includes('test me') || normalizedQuery.includes('test my knowledge')) {
      const questions = lessonQuizzes[lesson.id] || lessonQuizzes['lesson-002-01'];
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `Let's test your understanding of **${lesson.title}**! Here is a 5-question interactive check to reinforce your knowledge.`,
          actionType: 'quiz',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          quizData: {
            questions,
            currentQuestionIndex: 0,
            userAnswers: {},
            isSubmitted: false
          }
        },
        state: 'quiz'
      };
    }

    // 2. Challenge Mode Trigger
    if (actionType === 'challenge' || normalizedQuery.includes('challenge') || normalizedQuery.includes('scenario') || normalizedQuery.includes('practical activity')) {
      const scenario = lessonChallenges[lesson.id] || lessonChallenges['lesson-002-01'];
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### 🎯 Apply What You've Learned\n\nLet's put theory into practice with a realistic workplace scenario. Read the context below and submit your recommendations. I will review your answer and provide tailored feedback.`,
          actionType: 'challenge',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          challengeData: {
            scenario
          }
        },
        state: 'challenge'
      };
    }

    // 3. Explain Action
    if (actionType === 'explain' || normalizedQuery.includes('explain') || normalizedQuery.includes('what is')) {
      const lessonTheme = this.getLessonTheme(lesson);
      const learningObjective = lesson.learningObjectives?.[0] || 'understand the main concept in this lesson';

      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Overview: ${lesson.title}\n\nThis lesson is centered on **${lessonTheme}**. The main idea is to understand how this topic supports better decisions, creativity, or operational improvement in real practice.\n\n**Why it matters:** ${lesson.description}\n\n**Focus areas:**\n- ${lesson.learningObjectives?.slice(0, 3).join('\n- ') || learningObjective}\n\nIn simple terms, this lesson helps you connect the concept to a practical business or learning situation rather than treating it as abstract theory.`,
          actionType: 'explain',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Give me an example', 'Simplify this', 'Test my knowledge', 'What should I remember?']
        }
      };
    }

    // 4. Simplify Action
    if (actionType === 'simplify' || normalizedQuery.includes('simplify') || normalizedQuery.includes('simple terms') || normalizedQuery.includes('eli5')) {
      const lessonTheme = this.getLessonTheme(lesson);

      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### In Simple Terms 💡\n\nThink of **${lessonTheme}** as the practical idea behind this lesson: you are learning a way to turn information or observation into useful action.\n\nInstead of viewing it as a complicated technical concept, focus on the purpose: how it helps people make better decisions, uncover hidden patterns, or improve outcomes in the real world.\n\nThe key is to connect the concept to the task, the evidence, and the decision you are trying to support.`,
          actionType: 'simplify',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Give me an example', 'Test me', 'What should I focus on?']
        }
      };
    }

    // 5. Example Action
    if (actionType === 'example' || normalizedQuery.includes('example') || normalizedQuery.includes('case study')) {
      const lessonTheme = this.getLessonTheme(lesson);

      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Workplace Example: Applying **${lessonTheme}** 🏢\n\n**Scenario:** A team is trying to solve a real work problem and wants to use the ideas from this lesson to make better decisions.\n\n1. They start by identifying the problem, the evidence available, and the outcome they actually want.\n2. They apply the lesson method or principle to organize the information in a clearer way.\n3. They review the result with human judgment before acting on it.\n\n**Why this is useful:** It turns an abstract concept into a practical workflow that improves quality, speed, or decision confidence.`,
          actionType: 'example',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Explain the steps', 'Test my knowledge', 'Give another example']
        }
      };
    }

    // 6. Summarise Action
    if (actionType === 'summarise' || normalizedQuery.includes('summarise') || normalizedQuery.includes('summary') || normalizedQuery.includes('key points')) {
      const objectiveText = lesson.learningObjectives && lesson.learningObjectives.length > 0
        ? lesson.learningObjectives.map((objective) => `- ${objective}`).join('\n')
        : '- Understand the core idea of the lesson';

      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### 📌 Lesson Summary: ${lesson.title}\n\n1. **Main idea:** This lesson is about **${this.getLessonTheme(lesson)}** and how it connects to practical work or learning outcomes.\n2. **Purpose:** It helps you move from theory to action by identifying what matters most in the given context.\n3. **Application:** The lesson is most useful when you connect it to a real problem, opportunity, or decision.\n4. **Success principle:** Use evidence, reflection, and sound judgment to apply the lesson well.\n\n**Key focus points:**\n${objectiveText}`,
          actionType: 'summarise',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Start a 5-question Quiz', 'Show Workplace Challenge', 'Explain the key concept']
        }
      };
    }

    // 7. General Questions / Free-form query handling
    if (normalizedQuery.includes('hallucination') || normalizedQuery.includes('accuracy') || normalizedQuery.includes('mistake')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Why Hallucinations Occur & How to Prevent Them 🔍\n\nAn AI "hallucination" happens when a model generates convincing but factually incorrect or ungrounded statements.\n\n**Why it happens:**\nLLMs optimize for plausible statistical sentence structure, not conscious truth verification.\n\n**Best Prevention Strategies:**\n1. **Grounding:** Paste the source document (e.g. your policy PDF) into the prompt context.\n2. **Explicit Constraints:** Tell the AI: *"Only answer using the facts provided in the text above. If not mentioned, state 'I do not know'."*\n3. **Human-in-the-Loop:** Always conduct professional factual spot-checks before publication.`,
          suggestions: ['Give an example prompt', 'Test my knowledge', 'What is POPIA compliance?']
        }
      };
    }

    if (normalizedQuery.includes('popia') || normalizedQuery.includes('privacy') || normalizedQuery.includes('confidential') || normalizedQuery.includes('security')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Data Privacy & POPIA in AI Usage 🛡️\n\nUnder South Africa's **Protection of Personal Information Act (POPIA)**, organizations are responsible for safeguarding personal and confidential data.\n\n**Workplace Guidelines:**\n- **Never** paste employee IDs, banking details, passwords, or client PII into open consumer AI platforms.\n- Use enterprise accounts that offer **zero data retention** (where your data is not used to train global models).\n- Redact sensitive identifiers before running summarizations.`,
          suggestions: ['Summarise key rules', 'Test my knowledge', 'Explain prompt frameworks']
        }
      };
    }

    if (normalizedQuery.includes('token') || normalizedQuery.includes('context window')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Tokens & Context Windows Explained 🧩\n\n- **Token:** A token is a chunk of characters (typically 4 characters or ~0.75 English words). For instance, the word *"understanding"* might be broken into 3 tokens: \`under\`, \`stand\`, and \`ing\`.\n- **Context Window:** This is the memory buffer the AI can reference in a single conversation. Modern models have windows ranging from 8,000 to over 1,000,000 tokens, enabling you to analyze entire annual reports at once!`,
          suggestions: ['Explain how prompts work', 'Give an example', 'Test my knowledge']
        }
      };
    }

    // Default intelligent conversational response
    return {
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp,
        content: `Great question regarding **${lesson.title}**!\n\nThis lesson is specifically about **${this.getLessonTheme(lesson)}**, so the best way to answer is to connect your question to the actual learning goals, evidence, and real-world application in this topic.\n\nThe main takeaway is that this concept is most useful when you apply it thoughtfully to a real problem, decision, or work context.\n\nWould you like me to explain it in more detail, give an example, or test your recall?`,
        suggestions: ['Explain this in detail', 'Give me an example', 'Test my knowledge', 'Simplify']
      }
    };
  }

  /**
   * Evaluates a learner's challenge answer and gives rich constructive feedback
   */
  static async evaluateChallenge(
    userSubmission: string,
    scenario: typeof lessonChallenges['lesson-002-01']
  ): Promise<ChallengeEvaluation> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const text = userSubmission.toLowerCase();
    const mentionsPrivacy = text.includes('privacy') || text.includes('popia') || text.includes('confidential') || text.includes('data') || text.includes('security');
    const mentionsReview = text.includes('review') || text.includes('human') || text.includes('verify') || text.includes('check') || text.includes('accuracy') || text.includes('oversight');
    const mentionsTraining = text.includes('training') || text.includes('prompt') || text.includes('guidelines') || text.includes('policy') || text.includes('learn');
    const mentionsUseCases = text.includes('use case') || text.includes('pilot') || text.includes('department') || text.includes('draft');

    const strengths: string[] = [];
    const areasToImprove: string[] = [];
    let score = 70;

    if (mentionsPrivacy) {
      strengths.push('Strong focus on Data Protection & POPIA compliance regarding confidential business information.');
      score += 10;
    } else {
      areasToImprove.push('Remember to address data confidentiality: safeguard client and financial records from public AI tools.');
    }

    if (mentionsReview) {
      strengths.push('Excellent emphasis on Human-in-the-Loop verification to catch potential hallucinations.');
      score += 10;
    } else {
      areasToImprove.push('Include explicit verification workflows so employees never publish AI output without human review.');
    }

    if (mentionsTraining) {
      strengths.push('Recognized the critical need for employee prompt training and clear acceptable use guidelines.');
      score += 10;
    } else {
      areasToImprove.push('Consider adding structured team training on the RTCF prompt framework.');
    }

    if (mentionsUseCases) {
      strengths.push('Practical suggestion to define approved enterprise use cases.');
    }

    if (strengths.length === 0) {
      strengths.push('Solid initiative in addressing organizational change management.');
    }

    // Clamp score
    score = Math.min(Math.max(score, 65), 95);

    return {
      score,
      strengths,
      areasToImprove,
      expertFeedback: `Your recommendation demonstrates thoughtful consideration of organizational AI adoption. By pairing technological tools with clear governance policies, data privacy safeguards, and employee training, organizations can maximize productivity gains while mitigating hallucination and compliance risks.`,
      recommendedNextStep: 'Proceed to Lesson 2: Prompt Engineering for Business Teams to learn how to craft high-precision prompts.'
    };
  }
}

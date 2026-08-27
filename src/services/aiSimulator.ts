import { ChatMessage, ChallengeEvaluation, Lesson } from '../types';
import { lessonQuizzes, lessonChallenges } from '../data/mockQuizChallenges';

export interface AiResponseResult {
  message: ChatMessage;
  state?: 'conversation' | 'quiz' | 'challenge';
}

export class AiSimulatorService {
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
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Overview: ${lesson.title}\n\n**Generative AI** refers to AI systems that can create new content such as text, images, audio, code, or structured summaries based on patterns learned from existing data.\n\nIn this lesson, the important idea is that **generative AI doesn't simply retrieve information from a database — it generates a tailored response based on the context of your request.**\n\n**Key Takeaways:**\n- **Pattern Synthesis:** It predicts the most appropriate next words (tokens) according to context.\n- **Co-pilot Mindset:** It works best in partnership with human professionals (Human-in-the-loop).\n- **Speed & Structure:** Accelerates initial document drafting by up to 80% while you provide domain review.`,
          actionType: 'explain',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Give me an example', 'Simplify this', 'Test my knowledge', 'How do tokens work?']
        }
      };
    }

    // 4. Simplify Action
    if (actionType === 'simplify' || normalizedQuery.includes('simplify') || normalizedQuery.includes('simple terms') || normalizedQuery.includes('eli5')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### In Simple Terms 💡\n\nThink of traditional search like a **library index**: you look up a book title, and it points you to the exact existing book on the shelf.\n\n**Generative AI** is like an extremely well-read **research assistant sitting right next to you**: you give them notes or a goal, and they immediately write a fresh, customized first draft tailored specifically to your needs.\n\nIt doesn't copy-paste — it crafts a brand new response each time!`,
          actionType: 'simplify',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Give me an example', 'Test me', 'What is a token?']
        }
      };
    }

    // 5. Example Action
    if (actionType === 'example' || normalizedQuery.includes('example') || normalizedQuery.includes('case study')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### Workplace Example: Drafting an Internal SOP 🏢\n\n**Scenario:** An HR team at a Johannesburg logistics firm needs to draft an onboarding policy for remote workers.\n\n- **Without GenAI:** The HR specialist spends 4–6 hours drafting from a blank page.\n- **With GenAI Assistance:**\n  1. The specialist inputs: *"Draft a 4-step remote worker onboarding guide adhering to SA BCEA standards with bullet points for IT hardware sign-off."*\n  2. The AI delivers a structured draft in 15 seconds.\n  3. The specialist spends 30 minutes reviewing company-specific rules and finalizing approval.\n\n**Result:** 80% time saved with human domain oversight.`,
          actionType: 'example',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Explain how prompts work', 'Test my knowledge', 'Give another example']
        }
      };
    }

    // 6. Summarise Action
    if (actionType === 'summarise' || normalizedQuery.includes('summarise') || normalizedQuery.includes('summary') || normalizedQuery.includes('key points')) {
      return {
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp,
          content: `### 📌 Executive Lesson Summary\n\n1. **Core Distinction:** Generative AI generates novel contextual outputs; traditional search retrieves static records.\n2. **Mechanism:** Transformer models process numerical tokens and calculate statistical probabilities within a defined context window.\n3. **Workplace Application:** Ideal for drafting, document synthesis, and ideation.\n4. **Critical Rule:** Always verify factual accuracy to prevent hallucinations; maintain strict POPIA data privacy.`,
          actionType: 'summarise',
          contextLessonId: lesson.id,
          contextLessonTitle: lesson.title,
          suggestions: ['Start a 5-question Quiz', 'Show Workplace Challenge', 'Explain tokens']
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
        content: `Great question regarding **${lesson.title}**!\n\nIn the context of this lesson, this relates directly to how foundational models synthesize information and assist workplace productivity.\n\nGenerative AI serves as an accelerant for drafting, analyzing, and synthesizing information when paired with clear human domain direction.\n\nWould you like me to elaborate with a specific workplace case or test your recall?`,
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

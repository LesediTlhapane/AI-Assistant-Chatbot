import { QuizQuestion, ChallengeScenario } from '../types';

export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  'lesson-002-01': [
    {
      id: 'q-01',
      question: 'Which statement best describes generative AI?',
      options: [
        { id: 'A', text: 'It only retrieves information from databases.' },
        { id: 'B', text: 'It generates new content based on learned patterns.' },
        { id: 'C', text: 'It only analyses numerical data.' },
        { id: 'D', text: 'It replaces every human decision.' }
      ],
      correctAnswerId: 'B',
      explanation: 'Exactly. Generative AI can create new content (text, code, images, summaries) based on statistical patterns learned from training data, rather than just returning pre-stored files.',
      tip: 'Remember: Traditional search retrieves, while Generative AI synthesizes.'
    },
    {
      id: 'q-02',
      question: 'Why can Large Language Models sometimes produce "hallucinations" (factually inaccurate outputs)?',
      options: [
        { id: 'A', text: 'Because their servers run out of hard disk storage space.' },
        { id: 'B', text: 'They predict statistically probable token sequences rather than maintaining conscious factual awareness.' },
        { id: 'C', text: 'Because they intentionally try to mislead users.' },
        { id: 'D', text: 'They only function when connected to a live calculator.' }
      ],
      correctAnswerId: 'B',
      explanation: 'Spot on! LLMs operate by calculating probability distributions across tokens. When context is ambiguous, they generate the most plausible-sounding sequence, which can occasionally be factually incorrect without grounding.',
      tip: 'Always keep a Human-in-the-Loop for factual verification in business deliverables.'
    },
    {
      id: 'q-03',
      question: 'What is the recommended workplace best practice for using Generative AI in business writing?',
      options: [
        { id: 'A', text: 'Copy and paste AI output directly without reading it.' },
        { id: 'B', text: 'Use AI to generate first drafts and ideas (80%), then review, verify, and refine with human expertise (20%).' },
        { id: 'C', text: 'Only use AI for sending legal contracts without review.' },
        { id: 'D', text: 'Never use AI because it has no workplace utility.' }
      ],
      correctAnswerId: 'B',
      explanation: 'Great answer! The 80/20 collaborative approach uses GenAI to eliminate the blank-page syndrome and accelerate initial drafting, leaving high-value critical review to the human professional.',
      tip: 'Human oversight turns rough drafts into compliant, executive-ready work.'
    },
    {
      id: 'q-04',
      question: 'In the context of Large Language Models, what is a "Context Window"?',
      options: [
        { id: 'A', text: 'The physical size of the computer monitor used by the developer.' },
        { id: 'B', text: 'The total span of tokens (text) the model can hold in memory during an interaction.' },
        { id: 'C', text: 'A security firewall that blocks internet connections.' },
        { id: 'D', text: 'The pop-up window in your operating system.' }
      ],
      correctAnswerId: 'B',
      explanation: 'Correct! The context window determines how much conversation history, document text, and instructions the model can keep active in its immediate reasoning scope.',
      tip: 'Longer context windows allow for analyzing entire lengthy reports in a single prompt.'
    },
    {
      id: 'q-05',
      question: 'When using public, non-enterprise generative AI tools, what should you avoid entering?',
      options: [
        { id: 'A', text: 'General grammar questions and writing improvement requests.' },
        { id: 'B', text: 'Publicly available information and standard definitions.' },
        { id: 'C', text: 'Personally Identifiable Information (PII), confidential client data, and unreleased financial records.' },
        { id: 'D', text: 'Brainstorming topics for team icebreakers.' }
      ],
      correctAnswerId: 'C',
      explanation: 'Excellent! To safeguard privacy and adhere to data protection regulations like POPIA, proprietary or personal data must never be entered into public tools that use prompts for model retraining.',
      tip: 'Enterprise AI gateways with zero-data retention agreements are essential for sensitive work.'
    }
  ],
  'lesson-002-02': [
    {
      id: 'q-p1',
      question: 'What does the "RTCF" framework in prompt engineering stand for?',
      options: [
        { id: 'A', text: 'Return, Transfer, Cancel, Forward' },
        { id: 'B', text: 'Role, Task, Context, Format' },
        { id: 'C', text: 'Read, Type, Check, Finish' },
        { id: 'D', text: 'Random, Token, Calculate, Formula' }
      ],
      correctAnswerId: 'B',
      explanation: 'Exact match! Role, Task, Context, and Format give the AI model clear guardrails for high-quality enterprise outputs.',
      tip: 'Specifying the persona and explicit format constraints prevents generic responses.'
    }
  ]
};

export const lessonChallenges: Record<string, ChallengeScenario> = {
  'lesson-002-01': {
    id: 'ch-002-01',
    title: 'Generative AI Workplace Rollout Strategy',
    scenario: 'Your organisation (a medium-to-large business in South Africa) is preparing to introduce generative AI tools to assist knowledge workers in creating first drafts of internal reports, client communications, and standard operating procedures (SOPs).',
    promptQuestion: 'As a team lead or project manager, what key factors and guardrails would you recommend the leadership team consider before rolling out this tool across departments?',
    keyConsiderations: [
      'Data privacy & POPIA compliance (preventing sensitive customer/financial data leakage)',
      'Verification protocols & Human-in-the-Loop policies (addressing hallucinations)',
      'Employee training on effective prompt engineering and RTCF frameworks',
      'Clear acceptable use guidelines and transparent AI disclosure'
    ],
    sampleGoodAspects: [
      'Mentioned establishing a clear company AI policy and acceptable use guideline.',
      'Highlighted data privacy and protecting proprietary client information.',
      'Emphasized mandatory human review before sending or publishing any draft.',
      'Proposed team training to ensure equitable adoption and effective prompt crafting.'
    ]
  }
};

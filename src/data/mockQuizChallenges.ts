import { QuizQuestion, ChallengeScenario } from '../types';

export const lessonQuizzes: Record<string, QuizQuestion[]> = {
  'lesson-005-04': [
    {
      id: 'q1',
      question: 'What is the primary role of the HI-AI Discovery Framework?',
      options: [
        { id: 'a', text: 'To replace all human managers with autonomous AI agents' },
        { id: 'b', text: 'To systematically identify, frame, and prioritize high-value AI opportunities' },
        { id: 'c', text: 'To write raw Python code for neural network training' },
        { id: 'd', text: 'To eliminate the need for data governance policies' }
      ],
      correctAnswerId: 'b',
      explanation: 'The HI-AI Framework focuses on evaluating business feasibility, value, and readiness before deployment.',
      tip: 'Remember: Strategy and prioritization precede implementation.'
    },
    {
      id: 'q2',
      question: 'Under South African data privacy legislation (POPIA), what must you ensure when using AI tools?',
      options: [
        { id: 'a', text: 'All personal data must be publicly published on open servers' },
        { id: 'b', text: 'Zero data retention and proper de-identification of client and employee personal data' },
        { id: 'c', text: 'Only international vendors can process South African data' },
        { id: 'd', text: 'POPIA does not apply to digital or AI platforms' }
      ],
      correctAnswerId: 'b',
      explanation: 'POPIA requires safeguarding personal identifiable information (PII) and preventing unauthorized processing.',
      tip: 'Always anonymize client identifiers before using generative AI models.'
    },
    {
      id: 'q3',
      question: 'What does "Human-in-the-Loop" (HITL) mean in enterprise AI workflows?',
      options: [
        { id: 'a', text: 'A person must type every single character manually' },
        { id: 'b', text: 'Qualified human professionals review, verify, and validate AI outputs before final action' },
        { id: 'c', text: 'AI models can only operate during office hours' },
        { id: 'd', text: 'Human oversight is optional for high-stakes decisions' }
      ],
      correctAnswerId: 'b',
      explanation: 'Human verification mitigates hallucination risk and guarantees regulatory and strategic alignment.',
      tip: 'Never deploy generative outputs directly to clients without human validation.'
    }
  ],
  'lesson-002-01': [
    {
      id: 'q1',
      question: 'What is a core differentiator of Generative AI compared to traditional search engines?',
      options: [
        { id: 'a', text: 'Traditional search generates new text, while GenAI only indexes URLs' },
        { id: 'b', text: 'GenAI synthesizes contextual answers and generates novel artifacts based on probabilistic pattern matching' },
        { id: 'c', text: 'GenAI is deterministic and always returns identical answers' },
        { id: 'd', text: 'Search engines do not use algorithms' }
      ],
      correctAnswerId: 'b',
      explanation: 'Generative AI produces novel content tailored to user prompts rather than merely matching keywords.',
      tip: 'Think of GenAI as a reasoning and drafting engine rather than an indexed database.'
    }
  ]
};

export const lessonChallenges: Record<string, ChallengeScenario> = {
  'lesson-005-04': {
    id: 'sc-01',
    title: 'Prioritizing AI Opportunities for Customer Support',
    scenario: 'A major South African retail enterprise receives 40,000 inquiries monthly. The leadership team wants to apply the HI-AI Discovery Framework to evaluate whether to deploy an intelligent AI resolution agent.',
    promptQuestion: 'Draft a 3-point recommendation addressing Feasibility, POPIA Compliance, and Human-in-the-Loop Safeguards.',
    keyConsiderations: [
      'Data sanitization of account and ID numbers before LLM processing',
      'Establishing a clear escalation pathway to human customer service agents',
      'Measuring 30-day first-contact resolution rates and accuracy benchmarks'
    ],
    sampleGoodAspects: [
      'Explicit reference to POPIA compliance',
      'Defined fallback to human agents for dispute handling'
    ]
  },
  'lesson-002-01': {
    id: 'sc-02',
    title: 'Workplace AI Pilot Governance',
    scenario: 'Your organization is piloting an internal knowledge assistant for policy and standard operating procedures (SOPs).',
    promptQuestion: 'How would you structure the roll-out to ensure accurate answers and user trust?',
    keyConsiderations: [
      'Document chunking and grounding in verified HR policies',
      'Training team leaders on prompt construction and spot-checking',
      'Reviewing queries with low confidence scores'
    ],
    sampleGoodAspects: [
      'Structured pilot rollout with metrics',
      'Regular feedback loops between employees and AI coordinators'
    ]
  }
};

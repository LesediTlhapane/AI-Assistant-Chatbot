
import { GoogleGenAI } from '@google/genai';
import { ESTUDY_SYSTEM_PROMPT } from '../server/systemPrompt.js';

const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Only POST requests are supported.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'The AI service is not configured correctly.',
    });
  }

  try {
    const {
      message,
      actionType = 'general',
      context = {},
      conversationHistory = [],
    } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a question.',
      });
    }

    const safeContext = {
      courseName: context.courseName || 'eStudy South Africa Course',
      moduleName: context.moduleName || 'Current Module',
      lessonTitle: context.lessonTitle || 'Current Lesson',
      lessonContent: context.lessonContent || '',
    };

    const actionInstructions = {
      explain: 'Explain the topic clearly, step by step.',
      simplify: 'Explain the topic in very simple language.',
      example: 'Give a practical example and explain how it works.',
      summarise: 'Summarise the relevant learning material.',
      quiz: 'Create a short practice quiz based on the supplied course material.',
      challenge: 'Give the learner a practical challenge based on the course material.',
      general: 'Answer the learner’s question using the available course context.',
    };

    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-6).map((item) =>
          `${item.sender === 'assistant' ? 'Assistant' : 'Learner'}: ${
            String(item.content || '').slice(0, 500)
          }`
        ).join('\n')
      : '';

    const prompt = `
COURSE: ${safeContext.courseName}
MODULE: ${safeContext.moduleName}
LESSON: ${safeContext.lessonTitle}

COURSE MATERIAL:
${
  typeof safeContext.lessonContent === 'string'
    ? safeContext.lessonContent.slice(0, 3000)
    : JSON.stringify(safeContext.lessonContent).slice(0, 3000)
}

INSTRUCTION:
${actionInstructions[actionType] || actionInstructions.general}

PREVIOUS CONVERSATION:
${history || 'No previous conversation.'}

LEARNER'S QUESTION:
${message.trim()}

Answer as a helpful eStudy learning assistant. Use the supplied course material
when answering course-specific questions. Do not invent course content or claim
that information is in the course if it is not supported by the supplied material.
If the material does not cover the question, explain this clearly.
`;

    const ai = new GoogleGenAI({ apiKey });
    let answer = '';
    let lastError;

    for (const model of MODELS) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: ESTUDY_SYSTEM_PROMPT,
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        });

        answer = result.text || '';
        if (answer.trim()) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!answer.trim()) {
      console.error('Gemini request failed:', lastError?.message);

      return res.status(502).json({
        success: false,
        error: 'The AI service could not generate a response. Please try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        content: answer,
        actionType,
        contextLessonId: context.lessonId,
        contextLessonTitle: context.lessonTitle,
        suggestions: ['Simplify this', 'Give me an example'],
      },
    });
  } catch (error) {
    console.error('Chat API error:', error?.message);

    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
}

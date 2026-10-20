import Groq from 'groq-sdk';
import { ESTUDY_SYSTEM_PROMPT } from '../server/systemPrompt.js';

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MODELS = [
  PRIMARY_MODEL,
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Only POST requests are supported.',
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

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

  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    return res.status(200).json({
      success: true,
      message: {
        id: `msg-pending-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `⚡ **Groq LLM Engine Configured (${PRIMARY_MODEL})**\n\nThe chat engine is configured to use **Groq** with \`${PRIMARY_MODEL}\`.\n\nPlease set \`GROQ_API_KEY\` in your environment variables to enable live completions.`,
        actionType,
        contextLessonId: context.lessonId,
        contextLessonTitle: context.lessonTitle,
        suggestions: ['How does Groq work?', 'Check API status', 'Explain this lesson']
      },
      groqConfigured: false
    });
  }

  try {
    const safeContext = {
      courseName: context.courseName || context.courseTitle || 'eStudy South Africa Course',
      moduleName: context.moduleName || context.moduleTitle || 'Current Module',
      lessonTitle: context.lessonTitle || 'Current Lesson',
      lessonContent: context.lessonContent || '',
    };

    const actionInstructions = {
      explain: 'Explain the topic clearly, step by step. Never use LaTeX.',
      simplify: 'Explain the topic in very simple language with a relatable South African workplace analogy. Never use LaTeX.',
      example: 'Give a practical example and explain how it works. Never use LaTeX.',
      summarise: 'Summarise the relevant learning material in concise bullet points. Never use LaTeX.',
      quiz: 'Create a short practice quiz based on the supplied course material. Return strictly valid JSON with {"intro":"...","questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"a","explanation":"...","tip":"..."}]}.',
      challenge: 'Give the learner a practical challenge based on the course material.',
      general: 'Answer the learner’s question using the available course context. Follow all system prompt instructions.',
    };

    const historyMessages = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-6).map((item) => ({
          role: item.sender === 'user' || item.role === 'learner' ? 'user' : 'assistant',
          content: String(item.content || '').slice(0, 800)
        }))
      : [];

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

LEARNER'S QUESTION:
${message.trim()}
`;

    const groq = new Groq({ apiKey: apiKey.trim() });
    let answer = '';
    let lastError;

    for (const model of MODELS) {
      try {
        const result = await groq.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: ESTUDY_SYSTEM_PROMPT },
            ...historyMessages,
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2048,
        }, { timeout: 45000 });

        answer = result.choices[0]?.message?.content || '';
        if (answer.trim()) break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!answer.trim()) {
      console.error('Groq request failed:', lastError?.message);
      return res.status(502).json({
        success: false,
        error: `Groq service error: ${lastError?.message || 'Please try again.'}`,
      });
    }

    let quizData;
    if (actionType === 'quiz') {
      try {
        const jsonText = answer.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsedQuiz = JSON.parse(jsonText);
        if (Array.isArray(parsedQuiz.questions) && parsedQuiz.questions.length > 0) {
          quizData = { questions: parsedQuiz.questions };
          answer = parsedQuiz.intro || `Let's test your understanding of ${safeContext.lessonTitle}.`;
        }
      } catch (err) {
        console.warn('Quiz parsing error:', err.message);
      }
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
        suggestions: ['Simplify this', 'Give me an example', 'Take a quiz'],
        ...(quizData ? { quizData } : {})
      },
      ...(quizData ? { quizData } : {})
    });
  } catch (error) {
    console.error('Chat API error:', error?.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
}

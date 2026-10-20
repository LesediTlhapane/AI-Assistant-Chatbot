import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { createServer as createViteServer } from 'vite';
import { ESTUDY_SYSTEM_PROMPT } from './server/systemPrompt.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Candidate fallback Groq models
const MODEL_FALLBACK_CHAIN = Array.from(new Set([
  PRIMARY_MODEL,
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
]));

app.use(express.json({ limit: '2mb' }));

// CORS & Allowed Origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Initialize Groq client
function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY' || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new Groq({ apiKey: apiKey.trim() });
}

// GET /api/health
app.get('/api/health', (req, res) => {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5);
  res.json({
    status: 'online',
    assistant: 'AI BEE Champ / eStudy Learning Assistant',
    provider: 'Groq',
    primaryModel: PRIMARY_MODEL,
    groqConfigured: hasGroqKey
  });
});

// POST /api/chat - Main chat endpoint using Groq SDK
app.post('/api/chat', async (req, res) => {
  const { message, actionType = 'general', context = {}, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'A valid message string is required.'
    });
  }

  const sanitizedMessage = message.trim().slice(0, 3000);
  const groq = getGroqClient();

  // If GROQ_API_KEY is not yet provided
  if (!groq) {
    return res.status(200).json({
      success: true,
      message: {
        id: `msg-groq-pending-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `⚡ **Groq LLM Engine Configured (${PRIMARY_MODEL})**\n\nThe assistant backend has been switched to **Groq**.\n\nTo activate live Groq completions, configure your API key in your \`.env\` file:\n\`\`\`bash\nGROQ_API_KEY="gsk_..."\n\`\`\`\n\n*(Waiting for GROQ_API_KEY to start live inference)*`,
        actionType,
        contextLessonId: context.lessonId,
        contextLessonTitle: context.lessonTitle,
        suggestions: ['How does Groq work?', 'Check API status', 'Explain this lesson']
      },
      groqConfigured: false
    });
  }

  // 1. Build Context
  let contextPrompt = '=== CURRENT LEARNER CONTEXT ===\n';
  if (context.courseName || context.courseTitle) {
    contextPrompt += `Course: ${context.courseName || context.courseTitle} (${context.courseId || 'N/A'})\n`;
  }
  if (context.moduleName || context.moduleTitle) {
    contextPrompt += `Module: ${context.moduleName || context.moduleTitle} (${context.moduleId || 'N/A'})\n`;
  }
  if (context.lessonTitle) {
    contextPrompt += `Lesson: ${context.lessonTitle} (${context.lessonId || 'N/A'})\n`;
  }
  if (context.lessonDescription) {
    contextPrompt += `Description: ${context.lessonDescription}\n`;
  }
  if (context.lessonContent) {
    const sanitizedContent = typeof context.lessonContent === 'string' 
      ? context.lessonContent.slice(0, 3000) 
      : JSON.stringify(context.lessonContent).slice(0, 3000);
    contextPrompt += `Lesson Material:\n"${sanitizedContent}"\n`;
  }
  contextPrompt += '===============================\n\n';

  // 2. Build History
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  recentHistory.forEach((msg) => {
    if (msg.sender && msg.content) {
      historyMessages.push({
        role: msg.sender === 'user' || msg.role === 'learner' ? 'user' : 'assistant',
        content: String(msg.content).slice(0, 800)
      });
    }
  });

  // 3. Build Action Instruction
  let actionInstruction = '';
  switch (actionType) {
    case 'explain':
      actionInstruction = 'Provide a structured, easy-to-understand explanation of the concept based on the current lesson material. Use clear headings and bullet points. Never use LaTeX.';
      break;
    case 'simplify':
      actionInstruction = 'Explain the key concept in plain, simple terms using a relatable South African workplace analogy. Never use LaTeX.';
      break;
    case 'example':
      actionInstruction = 'Give a realistic South African workplace practical example illustrating how this lesson concept applies in day-to-day operations. Never use LaTeX.';
      break;
    case 'summarise':
      actionInstruction = 'Provide a concise, bulleted executive summary of the current lesson material. Never use LaTeX.';
      break;
    case 'quiz':
      actionInstruction = 'Create a 3 to 5 question quiz using ONLY the current lesson material. Return ONLY valid JSON with this exact shape: {"intro":"brief encouragement","questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"a","explanation":"...","tip":"..."}]}. Do not wrap in markdown quotes if possible, return strictly parseable JSON.';
      break;
    case 'challenge':
      actionInstruction = 'Create a practical workplace scenario challenge based on this lesson where the learner must recommend a structured solution.';
      break;
    default:
      actionInstruction = 'Respond thoughtfully to the learner query using the current lesson material as context. Follow all instructions in the system prompt.';
  }

  const prompt = `${contextPrompt}Instruction: ${actionInstruction}\nLearner Question/Prompt: "${sanitizedMessage}"`;

  let lastError: any = null;
  let replyText: string | null = null;

  for (const targetModel of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`[Groq Request] Attempting chat completion with model: ${targetModel}...`);
      const response = await groq.chat.completions.create({
        model: targetModel,
        messages: [
          {
            role: 'system',
            content: ESTUDY_SYSTEM_PROMPT
          },
          ...historyMessages,
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2048
      }, { timeout: 45000 });

      if (response && response.choices && response.choices[0]?.message?.content) {
        replyText = response.choices[0].message.content;
        console.log(`[Groq Request] Success with model: ${targetModel}`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Groq Request Warning] Model ${targetModel} error:`, err?.message || err);
    }
  }

  if (!replyText) {
    console.error('[Groq API Error]: All candidate models failed.', lastError?.message || lastError);
    return res.status(503).json({
      success: false,
      error: `Groq service error: ${lastError?.message || 'High demand. Please try again.'}`
    });
  }

  let quizData: any = undefined;
  if (actionType === 'quiz') {
    try {
      const jsonText = replyText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedQuiz = JSON.parse(jsonText);
      if (Array.isArray(parsedQuiz.questions) && parsedQuiz.questions.length > 0) {
        quizData = { questions: parsedQuiz.questions };
        replyText = parsedQuiz.intro || `Let's test your understanding of ${context.lessonTitle || 'this lesson'}.`;
      }
    } catch (err: any) {
      console.warn('[Groq Quiz Warning] Model did not return valid quiz JSON:', err?.message || err);
    }
  }

  const suggestions = [
    'Explain in simple terms',
    'Give a practical workplace example',
    'Summarise key points'
  ];

  return res.json({
    success: true,
    message: {
      id: `msg-groq-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyText,
      actionType,
      contextLessonId: context.lessonId,
      contextLessonTitle: context.lessonTitle,
      suggestions,
      ...(quizData ? { quizData } : {})
    },
    ...(quizData ? { quizData } : {})
  });
});

// Setup Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(` AI BEE Champ & eStudy AI Assistant Running`);
    console.log(` Powered by Groq (${PRIMARY_MODEL})`);
    console.log(` Port: http://localhost:${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`=================================================`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { createServer as createViteServer } from 'vite';
import { ESTUDY_SYSTEM_PROMPT } from './server/systemPrompt.js';
import { getKnowledgeBaseStatus, retrieveKnowledge } from './server/knowledgeBase.js';
import { summarizeModule } from './server/moduleSummary.js';
import { getResponseStyleInstruction, normalizeResponseStyle } from './server/responseStyle.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Candidate fallback Groq models
const MODEL_FALLBACK_CHAIN = Array.from(new Set([
  PRIMARY_MODEL,
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'allam-2-7b'
]));
let knowledgeBaseStatus = { moduleCount: 0, sectionCount: 0, modules: [] as string[] };

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
    groqConfigured: hasGroqKey,
    knowledgeBase: { status: 'ready', ...knowledgeBaseStatus }
  });
});

// POST /api/chat - Main chat endpoint using Groq SDK
app.post('/api/chat', async (req, res) => {
  const {
    message,
    actionType = 'general',
    responseStyle: requestedResponseStyle,
    context = {},
    conversationHistory = []
  } = req.body;
  const responseStyle = normalizeResponseStyle(requestedResponseStyle);

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
    return res.status(503).json({
      success: false,
      error: 'The AI service is not configured. Set GROQ_API_KEY on the server to enable knowledge-based answers.',
      groqConfigured: false
    });
  }

  // LMS metadata helps select relevant course material but is not used as a factual source.
  let contextPrompt = '=== LMS TOPIC HINTS ===\n';
  if (context.courseName || context.courseTitle) {
    contextPrompt += `Course: ${context.courseName || context.courseTitle} (${context.courseId || 'N/A'})\n`;
  }
  if (context.moduleName || context.moduleTitle) {
    contextPrompt += `Module: ${context.moduleName || context.moduleTitle} (${context.moduleId || 'N/A'})\n`;
  }
  if (context.lessonTitle) {
    contextPrompt += `Lesson: ${context.lessonTitle} (${context.lessonId || 'N/A'})\n`;
  }
  contextPrompt += '===============================\n\n';
  const knowledge = await retrieveKnowledge(
    sanitizedMessage,
    { ...context, lessonDescription: undefined },
    conversationHistory
  );
  const knowledgePrompt = knowledge.snippets.length > 0
    ? knowledge.snippets.map((snippet: { source: string; content: string }, index: number) =>
      `[Source ${index + 1}: ${snippet.source}]\n${snippet.content}`
    ).join('\n\n')
    : 'No relevant excerpts were found in the Module 1–3 knowledge base.';

  // 2. Build History
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-4) : [];
  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  recentHistory.forEach((msg) => {
    if (msg.sender && msg.content) {
      historyMessages.push({
        role: msg.sender === 'user' || msg.role === 'learner' ? 'user' : 'assistant',
        content: String(msg.content).slice(0, 500)
      });
    }
  });

  // 3. Build Action Instruction
  let actionInstruction = '';
  switch (actionType) {
    case 'explain':
      actionInstruction = 'Provide a structured, easy-to-understand explanation using only the supplied knowledge-base excerpts. Use clear headings and bullet points. Never use LaTeX.';
      break;
    case 'simplify':
      actionInstruction = 'Explain the key concept in plain, simple terms using only the supplied knowledge-base excerpts. Never use LaTeX.';
      break;
    case 'example':
      actionInstruction = 'Give a practical example grounded in the supplied knowledge-base excerpts. Make clear which details are illustrative. Never use LaTeX.';
      break;
    case 'summarise':
      actionInstruction = 'Provide a concise, bulleted summary of the relevant supplied knowledge-base excerpts. Never use LaTeX.';
      break;
    case 'quiz':
      actionInstruction = 'Create a 3 to 5 question quiz using ONLY the supplied knowledge-base excerpts. Return ONLY valid JSON with this exact shape: {"intro":"brief encouragement","questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"a","explanation":"...","tip":"..."}]}. Do not wrap in markdown quotes if possible, return strictly parseable JSON.';
      break;
    case 'challenge':
      actionInstruction = 'Create a practical learning challenge based only on the supplied knowledge-base excerpts.';
      break;
    default:
      actionInstruction = 'Answer the learner question using only the supplied knowledge-base excerpts. If they do not support an answer, say that the provided modules do not cover it.';
  }
  if (knowledge.isModuleSummary) {
    actionInstruction = 'Create a brief but comprehensive summary of the supplied module content, covering its major concepts and key takeaways. Never ask the learner to narrow the request. Never use LaTeX.';
  }

  const prompt = `${contextPrompt}KNOWLEDGE-BASE EXCERPTS:\n${knowledgePrompt}\n\nInstruction: ${actionInstruction}\nLearner Question/Prompt: "${sanitizedMessage}"`;

  let lastError: any = null;
  let replyText: string | null = null;

  if (knowledge.isModuleSummary) {
    try {
      replyText = await summarizeModule(knowledge.snippets, groq, MODEL_FALLBACK_CHAIN, responseStyle);
    } catch (err: any) {
      lastError = err;
    }
  } else {
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
            {
              role: 'system',
              content: getResponseStyleInstruction(responseStyle, actionType)
            },
            ...historyMessages,
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: actionType === 'quiz' ? 2048 : responseStyle === 'concise' ? 300 : 1600,
          ...(targetModel.startsWith('openai/gpt-oss-') || targetModel.startsWith('qwen/qwen3.')
            ? { reasoning_effort: 'low' }
            : {})
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
  knowledgeBaseStatus = await getKnowledgeBaseStatus();

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

  const listen = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`=================================================`);
      console.log(` AI BEE Champ & eStudy AI Assistant Running`);
      console.log(` Powered by Groq (${PRIMARY_MODEL})`);
      console.log(` Port: http://localhost:${port}`);
      console.log(` API Endpoint: http://localhost:${port}/api/chat`);
      console.log(`=================================================`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Port ${port} is in use. Retrying on port ${port + 1}...]`);
        listen(port + 1);
        return;
      }

      console.error('[Server Error]:', err);
      process.exitCode = 1;
    });
  };

  listen(PORT);
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exitCode = 1;
});

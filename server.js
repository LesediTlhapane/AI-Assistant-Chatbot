import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { ESTUDY_SYSTEM_PROMPT } from './server/systemPrompt.js';
import { getKnowledgeBaseStatus, getModuleContent, retrieveKnowledge } from './server/knowledgeBase.js';
import { summarizeModule } from './server/moduleSummary.js';
import { getResponseStyleInstruction, normalizeResponseStyle } from './server/responseStyle.js';
import { isVagueConceptRequest, VAGUE_CONCEPT_REPLY } from './server/clarification.js';
import { formatModuleConceptList, parseModuleSelection, resolveLearningTurn } from './server/learningFlow.js';
import { extractModuleConcepts } from './server/moduleConcepts.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3001', 10);
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// High-speed Groq models fallback chain
const MODEL_FALLBACK_CHAIN = Array.from(new Set([
  PRIMARY_MODEL,
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'allam-2-7b'
]));
let knowledgeBaseStatus = { moduleCount: 0, sectionCount: 0, modules: [] };

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// CORS & Allowed Origins Middleware
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

// Simple In-Memory Rate Limiter (60 requests per minute per IP for Groq's high speed)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

function checkRateLimit(ip) {
  const now = Date.now();
  const userRecord = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > userRecord.resetTime) {
    userRecord.count = 1;
    userRecord.resetTime = now + RATE_LIMIT_WINDOW_MS;
    requestCounts.set(ip, userRecord);
    return true;
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userRecord.count += 1;
  requestCounts.set(ip, userRecord);
  return true;
}

// Initialize Groq Client
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY' || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    return null;
  }
  return new Groq({ apiKey: apiKey.trim() });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5);
  res.json({
    status: 'online',
    assistant: 'AI BEE Champ / eStudy Learning Assistant',
    provider: 'Groq',
    primaryModel: PRIMARY_MODEL,
    groqConfigured: hasApiKey,
    knowledgeBase: { status: 'ready', ...knowledgeBaseStatus }
  });
});

// POST /api/chat - Main Chat Endpoint with Groq LLM Engine
app.post('/api/chat', async (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: "You're sending requests too quickly. Please wait a moment and try again."
    });
  }

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

  // Sanitize message length
  const sanitizedMessage = message.trim().slice(0, 3000);

  if (isVagueConceptRequest(sanitizedMessage, conversationHistory, context)) {
    return res.json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: VAGUE_CONCEPT_REPLY,
        actionType,
        contextLessonId: context.lessonId,
        contextLessonTitle: context.lessonTitle
      }
    });
  }

  const moduleNumber = parseModuleSelection(sanitizedMessage);
  let selectedModule = null;
  if (moduleNumber !== null) {
    try {
      selectedModule = await getModuleContent(moduleNumber);
    } catch (error) {
      console.error('[Learning Flow] Unable to load selected module:', error?.message || error);
      return res.status(503).json({
        success: false,
        error: 'The selected module content is currently unavailable. Please try again later.'
      });
    }

    if (!selectedModule) {
      return res.json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Module ${moduleNumber} content is not available in the course knowledge base. Please check the module number or choose another module.`,
          actionType: 'general'
        }
      });
    }
  }

  const groq = getGroqClient();
  if (!groq) {
    return res.status(503).json({
      success: false,
      error: 'The AI service is not configured. Set GROQ_API_KEY on the server to enable knowledge-based answers.',
      groqConfigured: false
    });
  }

  if (selectedModule) {
    try {
      const concepts = await extractModuleConcepts(selectedModule, groq, MODEL_FALLBACK_CHAIN);
      return res.json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: formatModuleConceptList(selectedModule, concepts),
          actionType: 'general'
        }
      });
    } catch (error) {
      console.error('[Learning Flow] Module concept extraction failed:', error?.message || error);
      return res.status(502).json({
        success: false,
        error: 'I could not identify the concepts in that module from the course material. Please try again.'
      });
    }
  }

  const learningTurn = resolveLearningTurn(sanitizedMessage, conversationHistory);
  const learningActionType = learningTurn.actionType || actionType;
  if (learningTurn.needsConceptSelection) {
    return res.json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Which concept from ${learningTurn.moduleTitle} would you like help with?`,
        actionType: 'general'
      }
    });
  }

  const retrievalContext = {
    ...context,
    ...learningTurn.context,
    lessonDescription: undefined
  };

  // LMS metadata selects course material but is not a factual source.
  let contextPrompt = '=== LMS TOPIC HINTS ===\n';
  if (context.courseName || context.courseTitle) {
    contextPrompt += `Course: ${context.courseName || context.courseTitle} (${context.courseId || 'N/A'})\n`;
  }
  if (retrievalContext.moduleName || retrievalContext.moduleTitle) {
    contextPrompt += `Module: ${retrievalContext.moduleName || retrievalContext.moduleTitle} (${context.moduleId || 'N/A'})\n`;
  }
  if (context.lessonTitle) {
    contextPrompt += `Lesson: ${context.lessonTitle} (${context.lessonId || 'N/A'})\n`;
  }
  contextPrompt += '===============================\n\n';
  const knowledge = await retrieveKnowledge(learningTurn.message, retrievalContext, conversationHistory);
  if (retrievalContext.restrictToModule && knowledge.snippets.length === 0) {
    return res.json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `I couldn't find that concept in ${retrievalContext.moduleName} in the supplied course material. Could you choose one of the concepts listed for this module?`,
        actionType: 'general'
      }
    });
  }
  const knowledgePrompt = knowledge.snippets.length > 0
    ? knowledge.snippets.map((snippet) =>
      `[Source: ${snippet.source}]\n${snippet.content}`
    ).join('\n\n')
    : 'No relevant excerpts were found in the course knowledge base.';

  // 2. Build History (Limit to last 6 messages)
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-4) : [];
  const historyMessages = [];
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
  switch (learningActionType) {
    case 'explain':
      actionInstruction = 'Explain only the learner-selected concept in simple, understandable language with clear headings. Include a practical workplace example only when supported by the supplied excerpts. Do not introduce unrelated concepts. Never use LaTeX.';
      break;
    case 'simplify':
      actionInstruction = 'Explain the key concept in plain, simple terms using only the supplied knowledge-base excerpts. Never use LaTeX.';
      break;
    case 'example':
      actionInstruction = 'Give a practical example grounded in the supplied knowledge-base excerpts. Label illustrative details. Never use LaTeX.';
      break;
    case 'summarise':
      actionInstruction = 'Provide a concise, bulleted summary of the relevant knowledge-base excerpts. Never use LaTeX.';
      break;
    case 'quiz':
      actionInstruction = 'Create a 3 to 5 question quiz using ONLY the supplied knowledge-base excerpts. Return ONLY valid JSON with this exact shape: {"intro":"brief encouragement","questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"a","explanation":"...","tip":"..."}]}. Do not wrap in markdown quotes if possible, return strictly parseable JSON.';
      break;
    case 'challenge':
      actionInstruction = 'Create a practical learning challenge based only on the supplied knowledge-base excerpts.';
      break;
    default:
      actionInstruction = 'Answer using only the supplied knowledge-base excerpts. If they do not support an answer, say the provided modules do not cover it.';
  }
  if (knowledge.isModuleSummary) {
    actionInstruction = 'Create a brief but comprehensive summary of the supplied module content, covering its major concepts and key takeaways. Never ask the learner to narrow the request. Never use LaTeX.';
  }

  // 4. Combine into User Prompt
  const prompt = `${contextPrompt}KNOWLEDGE-BASE EXCERPTS:\n${knowledgePrompt}\n\nInstruction: ${actionInstruction}\nLearner Question/Prompt: "${learningTurn.message}"`;

  // 5. Call Groq Chat Completions API with fallback loop
  let lastError = null;
  let replyText = null;

  if (knowledge.isModuleSummary) {
    try {
      replyText = await summarizeModule(knowledge.snippets, groq, MODEL_FALLBACK_CHAIN, responseStyle);
    } catch (err) {
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
              content: getResponseStyleInstruction(responseStyle, learningActionType)
            },
            ...historyMessages,
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: learningActionType === 'quiz' ? 2048 : responseStyle === 'concise' ? 300 : 1600,
          ...(targetModel.startsWith('openai/gpt-oss-') || targetModel.startsWith('qwen/qwen3.')
            ? { reasoning_effort: 'low' }
            : {})
        }, { timeout: 45000 });

        if (response && response.choices && response.choices[0]?.message?.content) {
          replyText = response.choices[0].message.content;
          console.log(`[Groq Request] Success with model: ${targetModel}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Groq Request Warning] Model ${targetModel} error:`, err.message || err);
      }
    }
  }

  if (!replyText) {
    console.error('[Groq API Error]: All candidate models failed.', lastError?.message || lastError);
    return res.status(503).json({
      success: false,
      error: `Groq service encountered an error: ${lastError?.message || 'High demand. Please try again.'}`
    });
  }

  let quizData;
  if (learningActionType === 'quiz') {
    try {
      const jsonText = replyText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedQuiz = JSON.parse(jsonText);
      if (Array.isArray(parsedQuiz.questions) && parsedQuiz.questions.length > 0) {
        quizData = { questions: parsedQuiz.questions };
        replyText = parsedQuiz.intro || `Let's test your understanding of ${context.lessonTitle || 'this lesson'}.`;
      }
    } catch (err) {
      console.warn('[Groq Quiz Warning] Model did not return valid quiz JSON:', err.message || err);
    }
  }

  // Generate intelligent suggested next actions
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
      actionType: learningActionType,
      contextLessonId: context.lessonId,
      contextLessonTitle: context.lessonTitle,
      suggestions,
      ...(quizData ? { quizData } : {})
    },
    ...(quizData ? { quizData } : {})
  });
});

// Serve static frontend build files in production if available
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback route for SPA / embed route
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (req.accepts('html')) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>AI BEE Champ / eStudy AI Assistant API</title></head>
            <body style="font-family: sans-serif; padding: 2rem; line-height: 1.6;">
              <h2>AI BEE Champ / eStudy AI Assistant Server (Groq Powered)</h2>
              <p>Status: <strong>Running on port ${DEFAULT_PORT}</strong></p>
              <p>Active Engine: <strong>Groq (${PRIMARY_MODEL})</strong></p>
              <p>Backend API endpoint: <code>POST /api/chat</code></p>
            </body>
          </html>
        `);
      }
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Smart Server Port Listener with Automatic Port Fallback
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=================================================`);
    console.log(` AI BEE Champ & eStudy AI Assistant Running`);
    console.log(` Powered by Groq (${PRIMARY_MODEL})`);
    console.log(` Port: http://localhost:${portToTry}`);
    console.log(` API Endpoint: http://localhost:${portToTry}/api/chat`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${portToTry} is in use. Retrying on port ${portToTry + 1}...]`);
      startServer(portToTry + 1);
    } else {
      console.error('[Server Error]:', err);
    }
  });
}

getKnowledgeBaseStatus()
  .then((status) => {
    knowledgeBaseStatus = status;
    startServer(DEFAULT_PORT);
  })
  .catch((err) => {
    console.error('Failed to load knowledge base:', err);
    process.exitCode = 1;
  });

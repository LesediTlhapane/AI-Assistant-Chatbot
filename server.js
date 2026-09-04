import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { ESTUDY_SYSTEM_PROMPT } from './server/systemPrompt.js';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3001', 10);
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// High-speed, high-availability active Flash models (Prioritizes 3.1-flash-lite for instant responses)
const MODEL_FALLBACK_CHAIN = Array.from(new Set([
  'gemini-3.1-flash-lite',
  PRIMARY_MODEL,
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
]));

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

// Simple In-Memory Rate Limiter (30 requests per minute per IP)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

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

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
  res.json({
    status: 'online',
    assistant: 'eStudy South Africa AI Assistant',
    primaryModel: PRIMARY_MODEL,
    geminiConfigured: hasApiKey
  });
});

// POST /api/chat - Main Chat Endpoint with Active Flash Model Fallback
app.post('/api/chat', async (req, res) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
  
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: "You're sending requests too quickly. Please wait a moment and try again."
    });
  }

  const { message, actionType = 'general', context = {}, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'A valid message string is required.'
    });
  }

  // Sanitize message length
  const sanitizedMessage = message.trim().slice(0, 2000);

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({
      success: false,
      error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in environment variables.'
    });
  }

  // 1. Build Context Header
  let contextPrompt = '=== CURRENT LEARNER CONTEXT ===\n';
  if (context.courseName) contextPrompt += `Course: ${context.courseName} (${context.courseId || 'N/A'})\n`;
  if (context.moduleName) contextPrompt += `Module: ${context.moduleName} (${context.moduleId || 'N/A'})\n`;
  if (context.lessonTitle) contextPrompt += `Lesson: ${context.lessonTitle} (${context.lessonId || 'N/A'})\n`;
  if (context.lessonContent) {
    const sanitizedContent = typeof context.lessonContent === 'string' 
      ? context.lessonContent.slice(0, 3000) 
      : JSON.stringify(context.lessonContent).slice(0, 3000);
    contextPrompt += `Lesson Material:\n"${sanitizedContent}"\n`;
  }
  contextPrompt += '===============================\n\n';

  // 2. Build History (Limit to last 6 messages)
  const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
  let historyText = '';
  if (recentHistory.length > 0) {
    historyText = '=== RECENT CONVERSATION HISTORY ===\n';
    recentHistory.forEach((msg) => {
      if (msg.sender && msg.content) {
        const role = msg.sender === 'user' ? 'Learner' : 'Assistant';
        historyText += `${role}: ${msg.content.slice(0, 500)}\n`;
      }
    });
    historyText += '===================================\n\n';
  }

  // 3. Build Action Instruction
  let actionInstruction = '';
  switch (actionType) {
    case 'explain':
      actionInstruction = 'Provide a structured, easy-to-understand explanation of the concept based on the current lesson material.';
      break;
    case 'simplify':
      actionInstruction = 'Explain the key concept in very simple language with a relatable South African workplace analogy.';
      break;
    case 'example':
      actionInstruction = 'Give a realistic South African workplace practical example illustrating how this lesson concept applies.';
      break;
    case 'summarise':
      actionInstruction = 'Provide a concise, bulleted executive summary of the current lesson material.';
      break;
    case 'quiz':
      actionInstruction = 'Formulate a 3 to 5 question interactive quiz check based on the current lesson material.';
      break;
    case 'challenge':
      actionInstruction = 'Create a practical workplace scenario challenge based on this lesson where the learner must recommend a solution.';
      break;
    default:
      actionInstruction = 'Respond thoughtfully to the learner query using the current lesson material as context.';
  }

  // 4. Combine into Full Prompt
  const fullPrompt = `${contextPrompt}${historyText}Instruction: ${actionInstruction}\nLearner Question/Prompt: "${sanitizedMessage}"`;

  // 5. Call Gemini API with Fallback Loop across high-availability Flash models
  let lastError = null;
  let replyText = null;

  for (const targetModel of MODEL_FALLBACK_CHAIN) {
    try {
      console.log(`[Gemini Request] Attempting generation with model: ${targetModel}...`);
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: [fullPrompt],
        config: {
          systemInstruction: ESTUDY_SYSTEM_PROMPT,
          temperature: 0.4,
          maxOutputTokens: 1000
        }
      });

      if (response && response.text) {
        replyText = response.text;
        console.log(`[Gemini Request] Success with model: ${targetModel}`);
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Request Warning] Model ${targetModel} temporary error:`, err.message || err);
    }
  }

  if (!replyText) {
    console.error('[Gemini API Error]: All candidate models failed.', lastError?.message || lastError);
    return res.status(503).json({
      success: false,
      error: 'Google Gemini Flash service is currently experiencing high demand. Please try again in a few seconds.'
    });
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
      id: `msg-gemini-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: replyText,
      actionType,
      contextLessonId: context.lessonId,
      contextLessonTitle: context.lessonTitle,
      suggestions
    }
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
            <head><title>eStudy AI Assistant API Server</title></head>
            <body style="font-family: sans-serif; padding: 2rem; line-height: 1.6;">
              <h2>eStudy South Africa AI Assistant API Server</h2>
              <p>Status: <strong>Running on port ${DEFAULT_PORT}</strong></p>
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
    console.log(` eStudy AI Assistant Server Running`);
    console.log(` Port: http://localhost:${portToTry}`);
    console.log(` API Endpoint: http://localhost:${portToTry}/api/chat`);
    console.log(` Active Flash Models: ${MODEL_FALLBACK_CHAIN.join(', ')}`);
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

startServer(DEFAULT_PORT);

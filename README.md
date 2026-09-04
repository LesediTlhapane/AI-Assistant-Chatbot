# eStudy South Africa AI Learning Assistant

An enterprise LMS-ready AI Learning Assistant built for **eStudy South Africa**, powered by **Google Gemini 2.5 Flash** and designed for seamless embedding into **CrossKnowledge LMS**.

---

## 🎯 Purpose & Overview

The eStudy AI Assistant helps approximately 1,800 enrolled learners master their course material by providing:
- Structured, clear explanations of complex lesson topics.
- Simplified language with relatable South African workplace analogies.
- Practical business and workplace application examples.
- Executive summaries of lessons and modules.
- Academic integrity guidance for self-assessments and quizzes.
- Real-time lesson context awareness provided directly by CrossKnowledge LMS.

---

## 🏗️ System Architecture

```
                 CrossKnowledge LMS
                         │
                  eStudy AI Widget (public/widget.js)
                         │
                  Floating "Ask AI" Button
                         │
                  Right-side Slide Drawer
                         │
                    Chatbot Iframe (/embed)
                         │
                         ▼
             React Chatbot Frontend (Vite + TS)
                         │
                         ▼
                 Node.js / Express Backend (server.js)
                         │
                 Context Builder & Safety Checks
                         │
                 Rate Limiter (30 req/min/IP)
                         │
                         ▼
                Google Gemini 2.5 Flash API
```

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer), Lucide Icons.
- **Backend:** Node.js, Express, `@google/genai` (SDK v2.4.0), `dotenv`.
- **AI Model:** Google Gemini 2.5 Flash (`gemini-2.5-flash`).
- **Integration:** Embeddable iframe (`/embed`), JavaScript widget (`public/widget.js`), `postMessage` event listener.

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following environment variables:

```env
# Required for Gemini AI API calls (Server-side ONLY)
GEMINI_API_KEY=your_actual_gemini_api_key

# Configurable Gemini Model
GEMINI_MODEL=gemini-2.5-flash

# Backend Express Port
PORT=3001

# Approved origins for CORS and postMessage
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://estudy.co.za
```

> ⚠️ **CRITICAL SECURITY REQUIREMENT:**
> `GEMINI_API_KEY` is strictly server-side. It is NEVER shipped to client-side bundles or exposed to the browser.

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend API Server

In terminal 1:
```bash
npm run dev:server
```
*Runs Express backend server on `http://localhost:3001` with tsx reloading.*

### 3. Start the Frontend Application

In terminal 2:
```bash
npm run dev
```
*Runs Vite dev server on `http://localhost:3000` with API proxying to port 3001.*

Open `http://localhost:3000` in your browser to view the interactive demo LMS and chatbot.

---

## 🔌 CrossKnowledge LMS Integration

Detailed integration instructions are available in [docs/INTEGRATION.md](file:///c:/Users/LesediTlhapane/OneDrive%20-%20BEE%20Analyst%20%28Pty%29%20Ltd/Desktop/AI-Assistant-Chatbot/docs/INTEGRATION.md).

### Quick Summary:
1. **JavaScript Widget Integration**:
   ```html
   <script src="https://your-chatbot-domain.com/widget.js" data-chatbot-url="https://your-chatbot-domain.com/embed" defer></script>
   ```
2. **Direct Iframe Embedding**:
   ```html
   <iframe src="https://your-chatbot-domain.com/embed" style="width: 100%; height: 600px; border: none;"></iframe>
   ```
3. **Dynamic Context via `postMessage`**:
   ```js
   iframeWindow.postMessage({
     type: 'ESTUDY_CONTEXT',
     payload: {
       courseId: 'CK-101',
       courseName: 'Leadership & Management',
       moduleId: 'MOD-01',
       moduleName: 'Strategic Planning',
       lessonId: 'LESSON-01',
       lessonTitle: 'Swot Analysis in SA Business',
       lessonContent: '...',
       learnerId: 'STUDENT-123'
     }
   }, '*');
   ```

---

## 🔒 Security Features

- **Key Isolation**: Server-side API invocation prevents secret leakage.
- **CORS Protection**: Origin validation restricts request origins.
- **Rate Limiting**: In-memory sliding window rate limiting prevents API abuse (30 requests/minute per client IP).
- **Origin Check**: `postMessage` event listener validates origin domains against `ALLOWED_ORIGINS`.
- **Token Efficiency**: System context limits lesson content and history size per prompt.

---

## 🧪 Verification & Build Commands

```bash
# Typecheck
npm run lint

# Build production bundle
npm run build

# Start production Express server
npm run start
```

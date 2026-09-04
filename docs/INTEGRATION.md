# eStudy South Africa AI Assistant - CrossKnowledge LMS Integration Guide

This guide details how **eStudy South Africa** and **CrossKnowledge LMS** administrators and developers can embed the eStudy AI Assistant into CrossKnowledge course pages.

---

## 🏗️ Architecture Overview

```
                      CrossKnowledge LMS Host Page
                                   │
                                   ▼
                       eStudy AI Widget (widget.js)
                                   │
                       Floating "Ask AI" Button
                                   │
                         Right-side Slide Drawer
                                   │
                        Chatbot Iframe (/embed)
                                   │
                        window.postMessage()
                     (Course & Learner Context)
                                   │
                                   ▼
                        React Chatbot UI Bundle
                                   │
                     POST /api/chat (HTTPS API)
                                   │
                         Node.js / Express
                                   │
                      Google Gemini 2.5 Flash
```

---

## 🔌 Integration Method 1: JavaScript Widget (Recommended)

The simplest and most seamless way to add the AI assistant to CrossKnowledge is by including the `widget.js` script tag in your CrossKnowledge course player template or page header.

### 1. Include Script Tag

Add the following tag to your CrossKnowledge page HTML:

```html
<script 
  src="https://your-ai-assistant-domain.com/widget.js" 
  data-chatbot-url="https://your-ai-assistant-domain.com/embed" 
  defer>
</script>
```

### 2. Supply Learner & Course Context (Optional / Automatic)

Define the global context on the CrossKnowledge page before or after loading the widget script:

```html
<script>
  window.eStudyLmsContext = {
    courseId: "CK-COURSE-101",
    courseName: "Vocational Leadership & Management",
    moduleId: "MOD-02",
    moduleName: "Operational Decision Making",
    lessonId: "LESSON-02-04",
    lessonTitle: "Root Cause Analysis in Workplace Scenarios",
    lessonContent: "Root Cause Analysis (RCA) is a systematic method used to identify the underlying causes of workplace breakdowns rather than just treating symptoms...",
    learnerId: "STUDENT-98745",
    learnerName: "Sibusiso Ndlovu",
    learnerRole: "Team Leader",
    organization: "eStudy South Africa"
  };
</script>
```

When the learner clicks **Ask AI**, the widget automatically opens a right-side drawer and transmits the current context to the AI assistant using secure `postMessage` communication.

---

## 🖼️ Integration Method 2: Direct Iframe Embedding

If you prefer to embed the AI assistant directly inside a CrossKnowledge page container or tab without using the floating widget button, use the `/embed` route directly.

### HTML Markup

```html
<iframe
  id="estudy-ai-iframe"
  src="https://your-ai-assistant-domain.com/embed"
  style="width: 100%; height: 650px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
  allow="microphone"
  title="eStudy AI Learning Assistant">
</iframe>
```

---

## 📨 Cross-Origin Context Communication via `postMessage`

When the user navigates to a new lesson or module inside CrossKnowledge, you can update the AI assistant's context dynamically without reloading the iframe.

### Host Page JavaScript Example

```javascript
const iframeWindow = document.getElementById('estudy-ai-iframe').contentWindow;

// Send updated context to the AI chatbot
iframeWindow.postMessage({
  type: 'ESTUDY_CONTEXT',
  payload: {
    courseId: "CK-COURSE-101",
    courseName: "Vocational Leadership & Management",
    moduleId: "MOD-03",
    moduleName: "Performance Management",
    lessonId: "LESSON-03-01",
    lessonTitle: "Conducting KPI Reviews",
    lessonContent: "Key Performance Indicators (KPIs) must be measurable, realistic, and aligned with company goals...",
    learnerId: "STUDENT-98745"
  }
}, 'https://your-ai-assistant-domain.com');
```

---

## 🔒 Security & CORS Configuration

1. **Origin Verification**: Configure allowed host origins on the chatbot server in `.env`:
   ```env
   ALLOWED_ORIGINS=https://estudy.crossknowledge.com,https://learning.estudy.co.za
   ```
2. **No Secret Exposure**: The `GEMINI_API_KEY` remains strictly server-side and is never sent to the browser or passed through `postMessage`.
3. **HTTPS Required**: Always host the chatbot backend on HTTPS in production to prevent mixed-content blocking in CrossKnowledge.

---

## 🛠️ CrossKnowledge Information Checklist for Production

Before final production rollout across 1,800 enrolled students, ensure the following parameters are aligned with eStudy South Africa:

- [ ] Production domain for hosting the chatbot application.
- [ ] Confirmed list of CrossKnowledge LMS domain origins for `ALLOWED_ORIGINS`.
- [ ] Google Gemini API Key configured in production environment variables (`GEMINI_API_KEY`).
- [ ] CrossKnowledge learner token / SSO verification strategy if persistent learner history tracking is desired for Version 2.

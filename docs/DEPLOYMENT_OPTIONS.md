# Chatbot Deployment Options

Replace `https://YOUR-CHATBOT-DOMAIN` in these examples with the public HTTPS
domain where the chatbot is deployed.

## 1. Webchat — Floating Bubble

Add the widget script to the LMS page or site template where the floating
**Ask AI** button should appear:

```html
<script
  src="https://YOUR-CHATBOT-DOMAIN/widget.js"
  data-chatbot-url="https://YOUR-CHATBOT-DOMAIN/embed"
  defer>
</script>
```

The widget opens the chatbot in a slide-out panel. The hosting LMS must allow
custom JavaScript on the page.

## 2. Full Page Chatbot

Link directly to the chatbot for a standalone, full-page experience:

```html
<a href="https://YOUR-CHATBOT-DOMAIN/embed" target="_blank" rel="noopener">
  Open the AI chatbot
</a>
```

You can also use `https://YOUR-CHATBOT-DOMAIN/embed` as the destination for an
LMS button or menu item.

## 3. Embedded Chatbot

Place the chatbot inside an LMS page, lesson, or content block:

```html
<iframe
  src="https://YOUR-CHATBOT-DOMAIN/embed"
  title="AI learning assistant"
  width="100%"
  height="650"
  style="border: 0; border-radius: 12px;"
  allow="microphone">
</iframe>
```

The LMS and chatbot must both allow the iframe to load. For lesson-aware
responses, the LMS can send course and lesson context to the chatbot using the
`ESTUDY_CONTEXT` `postMessage` interface described in
[INTEGRATION.md](./INTEGRATION.md).

## Before Deployment

- Serve the chatbot over HTTPS.
- Confirm the LMS permits the chosen script or iframe integration.
- Configure the deployed chatbot server's allowed origins for the LMS domain.
- Include `assets/knowledge base` and its DOCX files in the server deployment.
- Keep the Groq API key in the chatbot server environment; do not place it in
  LMS page code.

/**
 * eStudy South Africa - CrossKnowledge LMS AI Assistant Widget Script
 * 
 * Usage in CrossKnowledge LMS:
 * <script src="https://your-chatbot-domain.com/widget.js" 
 *         data-chatbot-url="https://your-chatbot-domain.com/embed" 
 *         defer></script>
 */

(function () {
  if (window.eStudyAiWidgetLoaded) return;
  window.eStudyAiWidgetLoaded = true;

  // Read Configuration from script attribute or window
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const CHATBOT_URL = (scriptTag && scriptTag.getAttribute('data-chatbot-url')) 
    || window.ESTUDY_CHATBOT_URL 
    || (window.location.origin + '/embed');

  let isOpen = false;

  // Create Container Elements
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'estudy-ai-widget-container';
  widgetContainer.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // 1. Floating Action Button
  const button = document.createElement('button');
  button.id = 'estudy-ai-trigger-btn';
  button.ariaLabel = 'Ask AI Assistant';
  button.title = 'Ask AI Assistant';
  button.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    background: #052B66;
    color: #ffffff;
    border: 2px solid #45CC42;
    width: 60px;
    height: 60px;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 10px 25px -5px rgba(5, 43, 102, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  `;
  button.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"></path>
      <path d="M8 12h.01"></path>
      <path d="M12 12h.01"></path>
      <path d="M16 12h.01"></path>
    </svg>
  `;

  button.onmouseover = () => { button.style.transform = 'scale(1.04)'; };
  button.onmouseout = () => { button.style.transform = 'scale(1)'; };

  // 2. Drawer Panel & Iframe
  const drawer = document.createElement('div');
  drawer.id = 'estudy-ai-drawer';
  drawer.style.cssText = `
    position: fixed;
    top: 0;
    right: -450px;
    width: 420px;
    max-width: 100vw;
    height: 100vh;
    background: #ffffff;
    box-shadow: -5px 0 30px rgba(0,0,0,0.15);
    z-index: 999998;
    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  `;

  // Responsive Drawer width on mobile
  if (window.innerWidth <= 640) {
    drawer.style.width = '100vw';
    drawer.style.right = '-100vw';
  }

  const iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;

  drawer.appendChild(iframe);
  document.body.appendChild(drawer);
  widgetContainer.appendChild(button);
  document.body.appendChild(widgetContainer);

  // Toggle Functionality
  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      drawer.style.right = '0px';
      button.style.display = 'none';
      // Sync host context when opening
      sendHostContextToIframe();
    } else {
      drawer.style.right = window.innerWidth <= 640 ? '-100vw' : '-450px';
      button.style.display = 'flex';
    }
  }

  button.onclick = toggleWidget;

  // Send Host LMS Context to iframe via postMessage
  function sendHostContextToIframe() {
    if (!iframe.contentWindow) return;

    // Extract context from host page variables or DOM if available
    const hostContext = window.eStudyLmsContext || {
      courseId: window.CROSSKNOWLEDGE_COURSE_ID || 'course-ck-01',
      courseName: window.CROSSKNOWLEDGE_COURSE_NAME || document.title || 'CrossKnowledge Course',
      moduleId: window.CROSSKNOWLEDGE_MODULE_ID || 'mod-01',
      moduleName: window.CROSSKNOWLEDGE_MODULE_NAME || 'Current Module',
      lessonId: window.CROSSKNOWLEDGE_LESSON_ID || 'lesson-01',
      lessonTitle: window.CROSSKNOWLEDGE_LESSON_TITLE || 'Current Lesson',
      lessonContent: window.CROSSKNOWLEDGE_LESSON_CONTENT || '',
      learnerId: window.CROSSKNOWLEDGE_LEARNER_ID || 'learner-ck'
    };

    iframe.contentWindow.postMessage({
      type: 'ESTUDY_CONTEXT',
      payload: hostContext
    }, '*');
  }

  // Global helper for host LMS to push updated context anytime
  window.eStudyAiWidget = {
    open: () => { if (!isOpen) toggleWidget(); },
    close: () => { if (isOpen) toggleWidget(); },
    updateContext: (context) => {
      window.eStudyLmsContext = context;
      sendHostContextToIframe();
    }
  };

  // Listen for close requests from inside iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ESTUDY_CLOSE_WIDGET') {
      if (isOpen) toggleWidget();
    }
  });

  // Handle window resizing for mobile width adjustment
  window.addEventListener('resize', () => {
    if (!isOpen) {
      drawer.style.right = window.innerWidth <= 640 ? '-100vw' : '-450px';
    }
    if (window.innerWidth <= 640) {
      drawer.style.width = '100vw';
    } else {
      drawer.style.width = '420px';
    }
  });

})();

import Groq from 'groq-sdk';
import { ESTUDY_SYSTEM_PROMPT } from '../server/systemPrompt.js';
import { getModuleContent, retrieveKnowledge } from '../server/knowledgeBase.js';
import { summarizeModule } from '../server/moduleSummary.js';
import { getResponseStyleInstruction, normalizeResponseStyle } from '../server/responseStyle.js';
import { isVagueConceptRequest, VAGUE_CONCEPT_REPLY } from '../server/clarification.js';
import { formatModuleConceptList, parseModuleSelection, resolveLearningTurn } from '../server/learningFlow.js';
import { extractModuleConcepts } from '../server/moduleConcepts.js';

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MODELS = Array.from(new Set([
  PRIMARY_MODEL,
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'allam-2-7b'
]));

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
    responseStyle: requestedResponseStyle,
    context = {},
    conversationHistory = [],
  } = req.body || {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a question.',
    });
  }

  if (isVagueConceptRequest(message, conversationHistory, context)) {
    return res.status(200).json({
      success: true,
      message: {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: VAGUE_CONCEPT_REPLY,
        actionType
      }
    });
  }

  const moduleNumber = parseModuleSelection(message);
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
      return res.status(200).json({
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

  if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey.trim() === '') {
    return res.status(503).json({
      success: false,
      error: 'The AI service is not configured. Set GROQ_API_KEY on the server to enable knowledge-based answers.',
      groqConfigured: false,
    });
  }

  try {
    const responseStyle = normalizeResponseStyle(requestedResponseStyle);
    const groq = new Groq({ apiKey: apiKey.trim() });
    if (selectedModule) {
      let concepts;
      try {
        concepts = await extractModuleConcepts(selectedModule, groq, MODELS);
      } catch (error) {
        console.error('[Learning Flow] Module concept extraction failed:', error?.message || error);
        return res.status(502).json({
          success: false,
          error: 'I could not identify the concepts in that module from the course material. Please try again.'
        });
      }

      return res.status(200).json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: formatModuleConceptList(selectedModule, concepts),
          actionType: 'general'
        }
      });
    }

    const learningTurn = resolveLearningTurn(message.trim(), conversationHistory);
    const learningActionType = learningTurn.actionType || actionType;
    if (learningTurn.needsConceptSelection) {
      return res.status(200).json({
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

    const safeContext = {
      courseName: context.courseName || context.courseTitle,
      moduleName: learningTurn.context.moduleName || context.moduleName || context.moduleTitle,
      lessonTitle: context.lessonTitle,
    };
    const retrievalContext = {
      ...context,
      ...learningTurn.context,
      lessonDescription: undefined,
    };
    const knowledge = await retrieveKnowledge(learningTurn.message, retrievalContext, conversationHistory);
    if (retrievalContext.restrictToModule && knowledge.snippets.length === 0) {
      return res.status(200).json({
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
      ? knowledge.snippets.map(({ source, content }) => `[Source: ${source}]\n${content}`).join('\n\n')
      : 'No relevant excerpts were found in the course knowledge base.';

    const actionInstructions = {
      explain: 'Explain only the learner-selected concept in simple, understandable language with clear headings. Include a practical workplace example only when supported by the supplied excerpts. Do not introduce unrelated concepts. Never use LaTeX.',
      simplify: 'Explain the topic in simple language using only the supplied knowledge-base excerpts. Never use LaTeX.',
      example: 'Give an example grounded in the supplied excerpts and label illustrative details. Never use LaTeX.',
      summarise: knowledge.isModuleSummary
        ? 'Create a brief but comprehensive summary of the supplied module content, covering its major concepts and key takeaways. Never ask the learner to narrow the request. Never use LaTeX.'
        : 'Summarise the relevant knowledge-base excerpts in concise bullet points. Never use LaTeX.',
      quiz: 'Create a short practice quiz using only the supplied excerpts. Return strictly valid JSON with {"intro":"...","questions":[{"id":"q1","question":"...","options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"a","explanation":"...","tip":"..."}]}.',
      challenge: 'Give the learner a practical challenge based only on the supplied knowledge-base excerpts.',
      general: 'Answer using only the supplied knowledge-base excerpts. If they do not support an answer, say the provided modules do not cover it.',
    };

    const historyMessages = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((item) => ({
          role: item.sender === 'user' || item.role === 'learner' ? 'user' : 'assistant',
          content: String(item.content || '').slice(0, 500)
        }))
      : [];

    const prompt = `
COURSE: ${safeContext.courseName}
MODULE: ${safeContext.moduleName}
LESSON: ${safeContext.lessonTitle}

AUTHORITATIVE KNOWLEDGE-BASE EXCERPTS:
${knowledgePrompt}

INSTRUCTION:
${knowledge.isModuleSummary
    ? 'Create a brief but comprehensive summary of the supplied module content, covering its major concepts and key takeaways. Never ask the learner to narrow the request. Never use LaTeX.'
    : actionInstructions[learningActionType] || actionInstructions.general}

LEARNER'S QUESTION:
${learningTurn.message}
`;

    let answer = '';
    let lastError;

    if (knowledge.isModuleSummary) {
      try {
        answer = await summarizeModule(knowledge.snippets, groq, MODELS, responseStyle);
      } catch (error) {
        lastError = error;
      }
    } else {
      for (const model of MODELS) {
        try {
          const result = await groq.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: ESTUDY_SYSTEM_PROMPT },
              { role: 'system', content: getResponseStyleInstruction(responseStyle, learningActionType) },
              ...historyMessages,
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: learningActionType === 'quiz' ? 2048 : responseStyle === 'concise' ? 300 : 1600,
            ...(model.startsWith('openai/gpt-oss-') || model.startsWith('qwen/qwen3.')
              ? { reasoning_effort: 'low' }
              : {}),
          }, { timeout: 45000 });

          answer = result.choices[0]?.message?.content || '';
          if (answer.trim()) break;
        } catch (error) {
          lastError = error;
        }
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
    if (learningActionType === 'quiz') {
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
        actionType: learningActionType,
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

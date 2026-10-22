import { getKnowledgeBaseStatus } from '../server/knowledgeBase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      status: 'error',
      error: 'Only GET requests are supported.'
    });
  }

  const groqConfigured = Boolean(
    process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()
  );

  try {
    const knowledgeBase = await getKnowledgeBaseStatus();
    return res.status(200).json({
      status: 'online',
      provider: 'Groq',
      groqConfigured,
      knowledgeBase: {
        status: 'ready',
        ...knowledgeBase
      }
    });
  } catch (error) {
    console.error('[Health Check] Knowledge base unavailable:', error?.message || error);
    return res.status(503).json({
      status: 'degraded',
      provider: 'Groq',
      groqConfigured,
      knowledgeBase: {
        status: 'unavailable'
      }
    });
  }
}

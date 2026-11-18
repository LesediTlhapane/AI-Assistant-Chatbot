export const VAGUE_CONCEPT_REPLY =
  "I’m happy to help explain a concept!\n\nCould you let me know which module or topic you’d like to explore?";

const GENERIC_CONCEPT_REQUEST_PATTERNS = [
  /^(?:(?:can|could|would) you )?(?:please )?explain (?:(?:a|the|any) )?(?:concept|something|anything|topic)(?: for me)?(?: (?:in|from|about) module (?:1[01]|[1-9]))?$/i,
  /^(?:(?:can|could|would) you )?(?:please )?help me understand (?:(?:a|the|any) )?(?:concept|something|anything|topic)(?: for me)?(?: (?:in|from|about) module (?:1[01]|[1-9]))?$/i,
  /^i (?:need|want) (?:some )?help understanding (?:(?:a|the|any) )?(?:concept|something|anything|topic)(?: for me)?(?: (?:in|from|about) module (?:1[01]|[1-9]))?$/i
];

const UNSPECIFIED_REFERENCE_PATTERNS = [
  /^(?:(?:can|could|would) you )?(?:please )?explain (?:this|that|it)(?: to me)?$/i,
  /^(?:(?:can|could|would) you )?(?:please )?help me understand (?:this|that|it)$/i
];

const NON_TOPIC_TERMS = new Set([
  'a', 'about', 'an', 'another', 'any', 'can', 'concept', 'could', 'example',
  'examples', 'explain', 'for', 'give', 'help', 'i', 'in', 'it', 'me',
  'module', 'of', 'please', 'something', 'that', 'the', 'this', 'to', 'topic',
  'understand', 'would', 'you'
]);

function normalizeMessage(message) {
  return message
    .trim()
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .toLowerCase();
}

function hasLearnerTopicReference(conversationHistory) {
  if (!Array.isArray(conversationHistory)) return false;

  const learnerMessages = conversationHistory.filter((item) =>
    (item?.sender === 'user' || item?.role === 'learner')
    && typeof item.content === 'string'
  );

  for (const item of learnerMessages.reverse()) {
    const previousMessage = normalizeMessage(item.content);
    const topicRequest = previousMessage.match(
      /^(?:(?:can|could|would) you )?(?:please )?(?:explain|describe|define|summari[sz]e|tell me (?:more )?about|what (?:is|are)|how (?:does|do)|why (?:does|do)|help me understand|give me an example of) (.+)$/i
    );
    if (!topicRequest) continue;

    const topicTerms = topicRequest[1]
      .replace(/\bmodule\s*(?:1[01]|[1-9])\b/ig, ' ')
      .match(/[a-z][a-z'-]*/g) || [];
    if (topicTerms.some((term) => !NON_TOPIC_TERMS.has(term))) return true;
  }

  return false;
}

export function isVagueConceptRequest(message, conversationHistory = [], context = {}) {
  if (typeof message !== 'string') return false;

  const normalizedMessage = normalizeMessage(message);
  if (GENERIC_CONCEPT_REQUEST_PATTERNS.some((pattern) => pattern.test(normalizedMessage))) {
    return true;
  }

  const isUnspecifiedReference = UNSPECIFIED_REFERENCE_PATTERNS.some((pattern) =>
    pattern.test(normalizedMessage)
  );
  if (!isUnspecifiedReference) return false;

  const hasLessonContext = [context?.lessonTitle, context?.lessonId]
    .some((value) => typeof value === 'string' && value.trim().length > 0);

  return !hasLessonContext && !hasLearnerTopicReference(conversationHistory);
}

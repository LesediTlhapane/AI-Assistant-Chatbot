export function normalizeResponseStyle(value) {
  return value === 'concise' ? 'concise' : 'detailed';
}

export function getResponseStyleInstruction(responseStyle, actionType = 'general') {
  if (responseStyle === 'concise') {
    return actionType === 'quiz'
      ? 'Use an executive, concise style. Keep the quiz introduction, explanations, and tips brief while preserving the required JSON format and every required question.'
      : 'Use an executive, concise style. Lead with the direct answer, then give only the essential supporting points. Use at most 100 words, with no more than 3 bullets. Do not add examples, background, or a conclusion unless essential to answer the question.';
  }

  return actionType === 'quiz'
    ? 'Use a comprehensive, in-depth style. Give learners clear, educational explanations and useful tips for each answer while preserving the required JSON format and every required question.'
    : 'Use a comprehensive, in-depth style. Explain the core concept, define important terms, and develop the key supporting points in clear sections or steps. Aim for 250–500 words when the supplied excerpts support that depth; do not invent facts or repeat points just to reach a length.';
}

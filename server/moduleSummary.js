import { ESTUDY_SYSTEM_PROMPT } from './systemPrompt.js';

const MAX_SUMMARY_EXCERPTS = 10;

function selectRepresentativeSnippets(snippets) {
  if (snippets.length <= MAX_SUMMARY_EXCERPTS) return snippets;

  return Array.from({ length: MAX_SUMMARY_EXCERPTS }, (_, index) => {
    const snippetIndex = Math.round(
      index * (snippets.length - 1) / (MAX_SUMMARY_EXCERPTS - 1)
    );
    return snippets[snippetIndex];
  });
}

export async function summarizeModule(snippets, groq, models, responseStyle = 'detailed') {
  const selectedSnippets = selectRepresentativeSnippets(snippets);
  const source = snippets[0]?.source || 'the selected module';
  const lengthInstruction = responseStyle === 'concise'
    ? 'Use exactly 5 concise bullet points and keep the answer under 150 words.'
    : 'Use 5 detailed bullet points, explaining the main concepts and their significance; aim for 250–400 words.';
  const prompt = `Create an overview of "${source}". The source excerpts are sampled across the module; use only facts they support, cover the main themes represented, and do not invent details or claim unsupported coverage. ${lengthInstruction} Finish every bullet.\n\n${selectedSnippets.map(({ source: snippetSource, content }, index) =>
    `[Excerpt ${index + 1} from ${snippetSource}]\n${content}`
  ).join('\n\n')}`;
  let lastError;

  for (const model of models) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: ESTUDY_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        ...(model.startsWith('openai/gpt-oss-') || model.startsWith('qwen/qwen3.')
          ? { reasoning_effort: 'low' }
          : {})
      }, { timeout: 45000 });
      const content = response.choices[0]?.message?.content;
      if (content?.trim()) return content.trim();
      lastError = new Error(`Model ${model} returned an empty module summary.`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No model was available to summarize the module.');
}

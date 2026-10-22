import { ESTUDY_SYSTEM_PROMPT } from './systemPrompt.js';

const MAX_BATCH_CHARACTERS = 9000;

function createBatches(snippets) {
  const batches = [];
  let batch = [];
  let batchLength = 0;

  for (const snippet of snippets) {
    const formatted = `[Source: ${snippet.source}]\n${snippet.content}`;
    if (batch.length > 0 && batchLength + formatted.length > MAX_BATCH_CHARACTERS) {
      batches.push(batch);
      batch = [];
      batchLength = 0;
    }
    batch.push(formatted);
    batchLength += formatted.length;
  }

  if (batch.length > 0) batches.push(batch);
  return batches;
}

async function completeWithFallback(groq, models, prompt, maxTokens) {
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
        max_tokens: maxTokens,
        reasoning_effort: 'low'
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

export async function summarizeModule(snippets, groq, models) {
  const batches = createBatches(snippets);
  const partialSummaries = [];

  for (const [index, batch] of batches.entries()) {
    partialSummaries.push(await completeWithFallback(
      groq,
      models,
      `Summarize the important concepts, definitions, and takeaways in this section of the course module. Use only the source text below, preserve the terminology, and return 4 to 6 concise bullet points.\n\n${batch.join('\n\n')}`,
      600
    ));
    console.log(`[Knowledge Base] Summarized module section ${index + 1} of ${batches.length}.`);
  }

  return completeWithFallback(
    groq,
    models,
    `Combine the section notes below into one brief, coherent summary of "${snippets[0]?.source}". Use that exact title as the heading. Give exactly 5 concise bullets covering the module's most important concepts and takeaways. Do not add facts that are not in the notes. Keep the entire answer under 150 words and finish every bullet.\n\n${partialSummaries.map((summary, index) => `[Section ${index + 1}]\n${summary}`).join('\n\n')}`,
    1200
  );
}

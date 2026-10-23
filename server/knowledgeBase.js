import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const KNOWLEDGE_DIRECTORY = path.resolve(
  process.env.VERCEL
    ? process.cwd()
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  'assets',
  'knowledge base'
);
const MAX_CHUNK_LENGTH = 1600;
const MAX_RESULTS = 6;
const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'for', 'from', 'give', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'should',
  'that', 'the', 'their', 'them', 'there', 'these', 'this', 'to', 'was',
  'we', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with',
  'would', 'you', 'your', 'module', 'lesson', 'course', 'explain', 'describe',
  'summarise', 'summarize', 'summary', 'tell', 'quiz', 'challenge'
]);

const FOLLOW_UP_TERMS = new Set([
  'example', 'examples', 'simplify', 'simpler', 'explain', 'clarify',
  'elaborate', 'expand', 'quiz', 'challenge', 'summarise', 'summarize',
  'summary'
]);

const MODULES = [
  { number: 1, pattern: /module[\s_-]*1|introduction[\s_-]*to[\s_-]*ai/i, title: 'Module 1: Introduction to Artificial Intelligence' },
  { number: 2, pattern: /module[\s_-]*2|key[\s_-]*concepts|terminolog/i, title: 'Module 2: AI Fundamentals — Key Concepts & Terminology' },
  { number: 3, pattern: /module[\s_-]*3|prompt[\s_-]*engineering/i, title: 'Module 3: Prompt Engineering' }
];

let knowledgeBasePromise;

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function splitLongParagraph(paragraph) {
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const parts = [];
  let current = '';

  for (const sentence of sentences) {
    if (sentence.length > MAX_CHUNK_LENGTH) {
      if (current) parts.push(current);
      current = '';

      let remainder = sentence;
      while (remainder.length > MAX_CHUNK_LENGTH) {
        let splitAt = remainder.lastIndexOf(' ', MAX_CHUNK_LENGTH);
        if (splitAt < 1) splitAt = MAX_CHUNK_LENGTH;
        parts.push(remainder.slice(0, splitAt).trim());
        remainder = remainder.slice(splitAt).trim();
      }
      current = remainder;
      continue;
    }

    const combined = current ? `${current} ${sentence}` : sentence;
    if (combined.length > MAX_CHUNK_LENGTH) {
      if (current) parts.push(current);
      current = sentence;
    } else {
      current = combined;
    }
  }

  if (current) parts.push(current);
  return parts;
}

function chunkDocument(text, source, module) {
  const paragraphs = text.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    for (const part of splitLongParagraph(paragraph)) {
      const combined = current ? `${current}\n${part}` : part;
      if (combined.length > MAX_CHUNK_LENGTH) {
        if (current) chunks.push(current);
        current = part;
      } else {
        current = combined;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.map((content, index) => ({
    content,
    source,
    moduleNumber: module.number,
    moduleTitle: module.title,
    terms: tokenize(content),
    index
  }));
}

async function loadKnowledgeBase() {
  const filenames = (await readdir(KNOWLEDGE_DIRECTORY))
    .filter((filename) => filename.toLowerCase().endsWith('.docx') && !filename.startsWith('~$'))
    .sort();

  if (filenames.length === 0) {
    throw new Error(`No DOCX knowledge documents found in "${KNOWLEDGE_DIRECTORY}".`);
  }

  const documents = [];
  for (const filename of filenames) {
    const module = MODULES.find((entry) => entry.pattern.test(filename));
    if (!module) {
      console.warn(`[Knowledge Base] Skipping unrecognized module document: ${filename}`);
      continue;
    }

    const filePath = path.join(KNOWLEDGE_DIRECTORY, filename);
    const { value } = await mammoth.extractRawText({ path: filePath });
    const chunks = chunkDocument(value, filename, module);
    if (chunks.length === 0) {
      throw new Error(`Knowledge document "${filename}" contains no extractable text.`);
    }

    documents.push({ filename, module, chunks });
  }

  if (documents.length === 0) {
    throw new Error(`No recognized Module 1, 2, or 3 DOCX documents found in "${KNOWLEDGE_DIRECTORY}".`);
  }

  const chunks = documents.flatMap((document) => document.chunks);
  const termDocumentCounts = new Map();
  for (const chunk of chunks) {
    for (const term of new Set(chunk.terms)) {
      termDocumentCounts.set(term, (termDocumentCounts.get(term) || 0) + 1);
    }
  }

  const averageLength = chunks.reduce((sum, chunk) => sum + chunk.terms.length, 0) / chunks.length;
  console.log(`[Knowledge Base] Loaded ${documents.length} modules and ${chunks.length} searchable sections.`);
  return { documents, chunks, termDocumentCounts, averageLength };
}

/**
 * Loads the course DOCX files once, then returns the most relevant sections.
 */
export async function retrieveKnowledge(query, context = {}, conversationHistory = []) {
  knowledgeBasePromise ||= loadKnowledgeBase();
  const knowledgeBase = await knowledgeBasePromise;
  const priorUserMessages = Array.isArray(conversationHistory)
    ? conversationHistory
      .filter((message) =>
        (message.sender === 'user' || message.role === 'learner')
        && typeof message.content === 'string'
      )
      .map((message) => message.content.trim())
      .filter((content) => content && content.toLowerCase() !== query.trim().toLowerCase())
      .slice(-6)
    : [];
  const historyModuleMatch = [...priorUserMessages].reverse()
    .map((message) => message.match(/\bmodule[\s_-]*([1-3])\b/i))
    .find(Boolean);
  const historyTopic = [...priorUserMessages].reverse().find((message) => {
    const terms = tokenize(message.replace(/\bmodule[\s_-]*[1-3]\b/ig, ' '));
    return terms.some((term) => !FOLLOW_UP_TERMS.has(term));
  }) || '';
  const contextText = [
    context.moduleName,
    context.moduleTitle,
    context.lessonTitle,
    context.lessonDescription,
    historyModuleMatch
      ? MODULES.find((module) => module.number === Number(historyModuleMatch[1]))?.title
      : undefined
  ].filter((value) => typeof value === 'string').join(' ');
  const isSummaryRequest = /\b(?:summary|summari[sz](?:e|ing|ed)?|overview|(?:key|main)\s+points|takeaways)\b/i.test(query);
  const queryModuleMatch = query.match(/\bmodule[\s_-]*([1-3])\b/i);
  const contextModuleMatch = contextText.match(/\bmodule[\s_-]*([1-3])\b/i);
  const queryModuleNumber = queryModuleMatch ? Number(queryModuleMatch[1]) : null;
  const queryModule = MODULES.find((module) => module.number === queryModuleNumber);
  const moduleTitleTerms = new Set(queryModule ? tokenize(queryModule.title) : []);
  const isModuleOnlyRequest = queryModuleMatch !== null
    && tokenize(query).every((term) => moduleTitleTerms.has(term));
  const summaryModuleMatch = queryModuleMatch || (
    /\b(?:this|the)\s+module\b/i.test(query) && !/\blesson\b/i.test(query)
      ? contextModuleMatch
      : null
  );

  if ((isSummaryRequest && summaryModuleMatch) || isModuleOnlyRequest) {
    const selectedModuleMatch = summaryModuleMatch || queryModuleMatch;
    const moduleNumber = Number(selectedModuleMatch[1]);
    const moduleChunks = knowledgeBase.chunks.filter((chunk) => chunk.moduleNumber === moduleNumber);
    if (moduleChunks.length > 0) {
      return {
        snippets: moduleChunks.map((chunk) => ({
          source: chunk.moduleTitle,
          content: chunk.content
        })),
        moduleCount: knowledgeBase.documents.length,
        isModuleSummary: true
      };
    }
  }

  const questionTerms = [...new Set(tokenize(query))];
  const queryTerms = questionTerms.length > 0
    ? questionTerms
    : [...new Set(tokenize(contextText))];

  if (queryTerms.length === 0) {
    return { snippets: [], moduleCount: knowledgeBase.documents.length };
  }

  const moduleMatch = queryModuleMatch || contextModuleMatch || historyModuleMatch;
  const requestedModule = moduleMatch ? Number(moduleMatch[1]) : null;
  const followUpTerms = tokenize(query).filter((term) => !FOLLOW_UP_TERMS.has(term));
  const isGenericFollowUp = tokenize(query).length > 0
    && followUpTerms.length === 0;
  const restrictToModule = isGenericFollowUp && requestedModule !== null;
  const retrievalQuery = isGenericFollowUp && historyTopic
    ? `${query} ${historyTopic}`
    : query;
  const retrievalTerms = [...new Set([
    ...tokenize(retrievalQuery),
    ...(isGenericFollowUp ? ['example', 'examples', 'scenario', 'workplace'] : [])
  ])];
  const totalChunks = knowledgeBase.chunks.length;
  const k1 = 1.5;
  const b = 0.75;

  const ranked = knowledgeBase.chunks
    .filter((chunk) => !restrictToModule || chunk.moduleNumber === requestedModule)
    .map((chunk) => {
    const frequencies = new Map();
    for (const term of chunk.terms) frequencies.set(term, (frequencies.get(term) || 0) + 1);

    let score = 0;
    for (const term of retrievalTerms) {
      const frequency = frequencies.get(term) || 0;
      if (!frequency) continue;

      const documentFrequency = knowledgeBase.termDocumentCounts.get(term) || 0;
      const inverseDocumentFrequency = Math.log(
        1 + (totalChunks - documentFrequency + 0.5) / (documentFrequency + 0.5)
      );
      const lengthNormalization = frequency + k1 * (
        1 - b + b * chunk.terms.length / knowledgeBase.averageLength
      );
      score += inverseDocumentFrequency * frequency * (k1 + 1) / lengthNormalization;
    }

    if (score > 0 && requestedModule === chunk.moduleNumber) score += 2;
    return { chunk, score };
  }).filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.index - right.chunk.index)
    .slice(0, MAX_RESULTS);

  return {
    snippets: ranked.map(({ chunk }) => ({
      source: chunk.moduleTitle,
      content: chunk.content
    })),
    moduleCount: knowledgeBase.documents.length
  };
}

export async function getKnowledgeBaseStatus() {
  knowledgeBasePromise ||= loadKnowledgeBase();
  const knowledgeBase = await knowledgeBasePromise;
  return {
    moduleCount: knowledgeBase.documents.length,
    sectionCount: knowledgeBase.chunks.length,
    modules: knowledgeBase.documents.map((document) => document.module.title)
  };
}

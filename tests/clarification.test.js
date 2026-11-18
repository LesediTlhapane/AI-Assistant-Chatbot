import assert from 'node:assert/strict';
import test from 'node:test';
import chatHandler from '../api/chat.js';
import { isVagueConceptRequest, VAGUE_CONCEPT_REPLY } from '../server/clarification.js';
import { getModuleContent } from '../server/knowledgeBase.js';
import { formatModuleConceptList, parseModuleSelection, resolveLearningTurn } from '../server/learningFlow.js';
import { extractModuleConcepts } from '../server/moduleConcepts.js';

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

async function postChat(body) {
  const response = createResponse();
  await chatHandler({ method: 'POST', body }, response);
  return response;
}

function installLearningFlowGroqMock(t) {
  const originalApiKey = process.env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  const requests = [];
  process.env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    const userPrompts = request.messages.filter((item) => item.role === 'user').map((item) => item.content);
    const prompt = userPrompts.find((item) => item.includes('Identify up to 8 distinct'))
      || userPrompts.at(-1)
      || '';
    const concepts = prompt.includes('MODULE: Module 1:')
      ? ['Artificial Intelligence', 'Generative AI', 'training data']
      : prompt.includes('MODULE: Module 6:')
        ? ['Cognitive bias', 'Complexity', 'Decision-making']
        : ['Intelligent Data Analytics', 'HI-AI Discovery Framework', 'AI readiness'];
    const content = prompt.includes('Identify up to 8 distinct')
      ? JSON.stringify({ concepts })
      : 'Mocked explanation grounded in the selected module excerpts.';

    return new Response(JSON.stringify({
      choices: [{ message: { content } }]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  t.after(() => {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
    globalThis.fetch = originalFetch;
  });
  return requests;
}

function getLastUserPrompt(request) {
  return request.messages.filter((item) => item.role === 'user').at(-1)?.content || '';
}

test('clarifies vague first messages with the exact requested response', async (t) => {
  const originalApiKey = process.env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  process.env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('The model must not be called for a vague request.');
  };

  t.after(() => {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
    globalThis.fetch = originalFetch;
  });

  for (const message of [
    'Explain a concept for me.',
    'Can you explain something?',
    'I need help understanding a concept.',
    'Help me understand something.',
    'Explain this to me.'
  ]) {
    const response = await postChat({ message });
    assert.equal(response.statusCode, 200, message);
    assert.equal(response.body.message.content, VAGUE_CONCEPT_REPLY, message);
  }
  assert.equal(fetchCalls, 0);
});

test('still clarifies a generic request after one or several detailed assistant answers', async (t) => {
  const originalApiKey = process.env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  process.env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('The model must not be called for a vague request.');
  };
  t.after(() => {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
    globalThis.fetch = originalFetch;
  });

  const histories = [
    [
      { sender: 'user', content: 'Explain data drift.' },
      { sender: 'assistant', content: 'A detailed explanation of data drift.' }
    ],
    [
      { sender: 'user', content: 'Explain data drift.' },
      { sender: 'assistant', content: 'A detailed explanation of data drift.' },
      { sender: 'user', content: 'Explain neural networks.' },
      { sender: 'assistant', content: 'A detailed explanation of neural networks.' }
    ]
  ];

  for (const conversationHistory of histories) {
    const response = await postChat({
      message: 'Explain a concept for me.',
      conversationHistory
    });
    assert.equal(response.body.message.content, VAGUE_CONCEPT_REPLY);
  }
  assert.equal(fetchCalls, 0);
});

test('does not use assistant-only history as a reference for “this”', () => {
  assert.equal(isVagueConceptRequest('Explain this to me.', [
    { sender: 'assistant', content: 'Here is an explanation of data drift.' }
  ]), true);
  assert.equal(isVagueConceptRequest('Explain this to me.', [
    { sender: 'user', content: 'I am ready.' },
    { sender: 'assistant', content: 'Here is an explanation of data drift.' }
  ]), true);
});

test('a specific learner topic or active lesson resolves a demonstrative reference', () => {
  assert.equal(isVagueConceptRequest('Explain this to me.', [
    { sender: 'user', content: 'Explain data drift.' },
    { sender: 'assistant', content: 'A detailed explanation of data drift.' }
  ]), false);
  assert.equal(isVagueConceptRequest('Explain this to me.', [], {
    lessonTitle: 'Data drift'
  }), false);
});

test('specific requests and clear follow-ups continue through the model path', async (t) => {
  const originalApiKey = process.env.GROQ_API_KEY;
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  process.env.GROQ_API_KEY = 'test-key';
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response(JSON.stringify({
      choices: [{ message: { content: 'Mocked answer grounded in the supplied excerpts.' } }]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  t.after(() => {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
    globalThis.fetch = originalFetch;
  });

  const requests = [
    {
      message: 'Explain data drift.',
      conversationHistory: []
    },
    {
      message: 'Can you give me another example?',
      conversationHistory: [
        { sender: 'user', content: 'Explain data drift.' },
        { sender: 'assistant', content: 'A detailed explanation of data drift.' }
      ]
    }
  ];

  for (const request of requests) {
    const response = await postChat(request);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.message.content, 'Mocked answer grounded in the supplied excerpts.');
  }
  assert.equal(fetchCalls, 2);
});

test('a module without a specified concept is still clarified', async () => {
  const response = await postChat({ message: 'Explain a concept in Module 1.' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message.content, VAGUE_CONCEPT_REPLY);
});

test('module selection produces a concise concept list extracted from only that module', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const module3 = await getModuleContent(3);
  const response = await postChat({
    message: 'Module 3.',
    conversationHistory: [
      { sender: 'user', content: 'Explain a concept for me.' },
      { sender: 'assistant', content: VAGUE_CONCEPT_REPLY }
    ]
  });

  assert.equal(parseModuleSelection('Module 3.'), 3);
  assert.match(response.body.message.content, /Module 3: Creative Thinking and AI/);
  assert.match(response.body.message.content, /1\. Intelligent Data Analytics/);
  assert.match(response.body.message.content, /2\. HI-AI Discovery Framework/);
  assert.match(response.body.message.content, /3\. AI readiness/);
  assert.match(response.body.message.content, /Which concept would you like me to explain\?$/);
  assert.equal(requests.length, 1);
  const extractionPrompt = getLastUserPrompt(requests[0]);
  assert.match(extractionPrompt, /Identify up to 8 distinct/);
  assert.match(extractionPrompt, /Intelligent Data Analytics/i);
  assert.ok(module3.snippets.every(({ source }) => source.includes('Module 3')));
  assert.doesNotMatch(extractionPrompt, /\[Source: Module 1/);
});

test('numbered concept selection explains only that concept from the selected module', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const module3 = await getModuleContent(3);
  const conceptList = formatModuleConceptList(module3, [
    'Intelligent Data Analytics',
    'HI-AI Discovery Framework',
    'AI readiness'
  ]);
  const response = await postChat({
    message: 'Explain number 2.',
    conversationHistory: [
      { sender: 'user', content: 'Explain a concept for me.' },
      { sender: 'assistant', content: VAGUE_CONCEPT_REPLY },
      { sender: 'user', content: 'Module 3.' },
      { sender: 'assistant', content: conceptList }
    ]
  });

  assert.equal(response.body.message.content, 'Mocked explanation grounded in the selected module excerpts.');
  assert.equal(response.body.message.actionType, 'explain');
  assert.equal(requests.length, 1);
  const explanationPrompt = getLastUserPrompt(requests[0]);
  assert.match(explanationPrompt, /LEARNER'S QUESTION:\s*HI-AI Discovery Framework/i);
  assert.match(explanationPrompt, /\[Source: Module 3/);
  assert.doesNotMatch(explanationPrompt, /\[Source: Module (?:[124-9]|10|11)/);
});

test('concept-name selection and follow-up examples retain the selected concept and module', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const module3 = await getModuleContent(3);
  const conceptList = formatModuleConceptList(module3, [
    'Intelligent Data Analytics',
    'HI-AI Discovery Framework',
    'AI readiness'
  ]);
  const history = [
    { sender: 'user', content: 'Module 3.' },
    { sender: 'assistant', content: conceptList }
  ];

  const namedSelection = await postChat({
    message: 'Explain the HI-AI Discovery Framework.',
    conversationHistory: history
  });
  assert.equal(namedSelection.body.message.content, 'Mocked explanation grounded in the selected module excerpts.');
  const namedPrompt = getLastUserPrompt(requests[0]);
  assert.match(namedPrompt, /LEARNER'S QUESTION:\s*HI-AI Discovery Framework/i);
  assert.match(namedPrompt, /\[Source: Module 3/);

  const exampleFollowUp = await postChat({
    message: 'Give me another example.',
    conversationHistory: [
      ...history,
      { sender: 'user', content: 'Explain number 2.' },
      { sender: 'assistant', content: 'A grounded explanation of the HI-AI Discovery Framework.' }
    ]
  });
  assert.equal(exampleFollowUp.body.message.content, 'Mocked explanation grounded in the selected module excerpts.');
  assert.equal(exampleFollowUp.body.message.actionType, 'example');
  const followUpPrompt = getLastUserPrompt(requests[1]);
  assert.match(followUpPrompt, /HI-AI Discovery Framework\. Give me another example/i);
  assert.match(followUpPrompt, /\[Source: Module 3/);
  assert.doesNotMatch(followUpPrompt, /\[Source: Module (?:[124-9]|10|11)/);
});

test('Module 1 selection also lists grounded concepts and supports concept selection', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const module1 = await getModuleContent(1);
  const listResponse = await postChat({ message: 'Module 1.' });
  assert.match(listResponse.body.message.content, /Module 1: AI 101/);
  assert.match(listResponse.body.message.content, /1\. Artificial Intelligence/);
  assert.ok(module1.snippets.every(({ source }) => source.includes('Module 1')));

  const explanation = await postChat({
    message: 'Explain number 1.',
    conversationHistory: [
      { sender: 'user', content: 'Module 1.' },
      { sender: 'assistant', content: listResponse.body.message.content }
    ]
  });
  assert.equal(explanation.body.message.content, 'Mocked explanation grounded in the selected module excerpts.');
  const explanationPrompt = getLastUserPrompt(requests[1]);
  assert.match(explanationPrompt, /LEARNER'S QUESTION:\s*Artificial Intelligence/i);
  assert.match(explanationPrompt, /\[Source: Module 1/);
  assert.doesNotMatch(explanationPrompt, /\[Source: Module (?:[2-9]|10|11)/);
});

test('Module 6 concept remains active through follow-up actions and updates on new selection', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const module6 = await getModuleContent(6);
  assert.ok(module6.snippets.some(({ content }) => /cognitive bias/i.test(content)));
  const conversationHistory = [];
  const send = async (message) => {
    const response = await postChat({ message, conversationHistory });
    conversationHistory.push(
      { sender: 'user', content: message },
      response.body.message
    );
    return response.body.message;
  };

  const moduleList = await send('Module 6.');
  assert.match(moduleList.content, /Module 6:/);
  assert.match(moduleList.content, /Cognitive bias/i);

  const firstExplanation = await send('Cognitive bias.');
  assert.equal(firstExplanation.actionType, 'explain');

  const followUps = [
    { prompt: 'Explain in simple terms.', action: 'simplify' },
    { prompt: 'Give me a practical workplace example.', action: 'example' },
    { prompt: 'Summarise the key points.', action: 'summarise' },
    { prompt: 'Give me another example.', action: 'example' }
  ];

  for (const { prompt, action } of followUps) {
    const reply = await send(prompt);
    assert.equal(reply.actionType, action, prompt);
    assert.match(reply.content, /Mocked explanation grounded in the selected module excerpts/);
  }

  const followUpRequests = requests.slice(2);
  assert.equal(followUpRequests.length, 4);
  for (const request of followUpRequests) {
    const prompt = getLastUserPrompt(request);
    assert.match(prompt, /Cognitive bias/i);
    assert.match(prompt, /\[Source: Module 6/);
    assert.doesNotMatch(prompt, /\[Source: Module (?:[1-5]|[7-9]|10|11)/);
  }

  const secondConcept = await send('Decision-making.');
  assert.equal(secondConcept.actionType, 'explain');
  const newConceptPrompt = getLastUserPrompt(requests.at(-1));
  assert.match(newConceptPrompt, /LEARNER'S QUESTION:\s*Decision-making/i);
  assert.match(newConceptPrompt, /\[Source: Module 6/);

  const newConceptFollowUp = await send('Can you elaborate?');
  assert.equal(newConceptFollowUp.actionType, 'explain');
  const retainedConceptPrompt = getLastUserPrompt(requests.at(-1));
  assert.match(retainedConceptPrompt, /Decision-making\. Can you elaborate/i);
  assert.doesNotMatch(retainedConceptPrompt, /Cognitive bias\. Can you elaborate/i);
});

test('all requested conversational follow-up phrasings resolve against the active concept', async () => {
  const module6 = await getModuleContent(6);
  const list = formatModuleConceptList(module6, ['Cognitive bias', 'Decision-making']);
  const conversationHistory = [
    { sender: 'user', content: 'Module 6.' },
    { sender: 'assistant', content: list },
    { sender: 'user', content: 'Cognitive bias.' },
    { sender: 'assistant', content: 'A grounded explanation of cognitive bias.' }
  ];
  const cases = [
    ['Explain in simple terms.', 'simplify'],
    ['Give me a practical workplace example.', 'example'],
    ['Summarise the key points.', 'summarise'],
    ['Can you explain that differently?', 'simplify'],
    ['Give me another example.', 'example'],
    ['Why is this important?', 'explain'],
    ['Can you elaborate?', 'explain'],
    ['Make it easier to understand.', 'simplify']
  ];

  for (const [message, actionType] of cases) {
    const turn = resolveLearningTurn(message, conversationHistory);
    assert.equal(turn.actionType, actionType, message);
    assert.match(turn.message, /^Cognitive bias\./, message);
    assert.equal(turn.context.moduleNumber, 6, message);
    assert.equal(turn.context.restrictToModule, true, message);
  }
});

test('module selection reports unavailable course content without calling the model', async (t) => {
  const requests = installLearningFlowGroqMock(t);
  const response = await postChat({ message: 'Module 12.' });
  assert.match(response.body.message.content, /Module 12 content is not available/);
  assert.equal(requests.length, 0);
});

test('module concept extraction rejects names absent from the selected source', async () => {
  const module3 = await getModuleContent(3);
  const groq = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({ concepts: ['Invented Quantum Leadership'] })
            }
          }]
        })
      }
    }
  };

  await assert.rejects(
    extractModuleConcepts(module3, groq, ['test-model']),
    /No extracted concept names could be verified/
  );
});

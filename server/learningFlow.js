function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parseModuleSelection(message) {
  if (typeof message !== 'string') return null;
  const match = message.trim().match(/^(?:please\s+)?module\s*#?\s*(\d{1,2})[.!?]?$/i);
  return match ? Number(match[1]) : null;
}

export function formatModuleConceptList(module, concepts) {
  const numberedConcepts = concepts.map((concept, index) => `${index + 1}. ${concept}`).join('\n');
  return `Great! ${module.moduleTitle}.\n\nHere are some of the concepts covered in this module:\n\n${numberedConcepts}\n\nWhich concept would you like me to explain?`;
}

export function getRecentModuleConceptList(conversationHistory) {
  if (!Array.isArray(conversationHistory)) return null;

  for (let index = conversationHistory.length - 1; index >= 0; index -= 1) {
    const message = conversationHistory[index];
    if (!(message?.sender === 'assistant' || message?.role === 'assistant') || typeof message.content !== 'string') {
      continue;
    }

    const markerIndex = message.content.indexOf('Here are some of the concepts covered in this module:');
    const moduleMatch = message.content.match(/\bModule\s*(\d{1,2}):\s*([^\r\n]+)/i);
    if (markerIndex < 0 || !moduleMatch) continue;

    const listText = message.content.slice(markerIndex).split(/Which concept would you like me to explain\?/i)[0];
    const concepts = [...listText.matchAll(/^\s*(\d+)\.\s+(.+?)\s*$/gm)]
      .map((match) => ({ number: Number(match[1]), name: match[2].trim() }));
    if (concepts.length === 0) continue;

    return {
      historyIndex: index,
      moduleNumber: Number(moduleMatch[1]),
      moduleTitle: `Module ${moduleMatch[1]}: ${moduleMatch[2].trim().replace(/[.!?]+$/, '')}`,
      concepts
    };
  }

  return null;
}

function findConceptSelection(message, conceptList) {
  const normalizedMessage = normalizeText(message);
  const numberMatch = normalizedMessage.match(
    /^(?:(?:please )?(?:explain|describe|teach me|tell me about) )?(?:(?:concept )?(?:number )?)(\d+)$/
  );
  if (numberMatch) {
    return conceptList.concepts.find((concept) => concept.number === Number(numberMatch[1])) || null;
  }

  return conceptList.concepts.find((concept) => {
    const normalizedConcept = normalizeText(concept.name);
    return normalizedConcept && normalizedMessage.includes(normalizedConcept);
  }) || null;
}

function getFollowUpIntent(message) {
  const normalizedMessage = normalizeText(message);
  if (
    /^(?:(?:can|could|would) you )?(?:please )?(?:explain|make) (?:this|that|it|the concept)? ?(?:in simple terms|more simply|more simply please|easier to understand|easier|differently|that differently)$/.test(normalizedMessage)
    || /^(?:make it easier to understand|simplify this|simplify it|explain simply)$/.test(normalizedMessage)
  ) {
    return 'simplify';
  }
  if (
    /^(?:(?:can|could|would) you )?(?:please )?(?:(?:give|show) me )?(?:another|a|an) (?:practical workplace |workplace )?(?:example|scenario)(?: please)?$/.test(normalizedMessage)
    || /^(?:(?:can|could|would) you )?(?:please )?give me a practical workplace example$/.test(normalizedMessage)
  ) {
    return 'example';
  }
  if (/^(?:(?:can|could|would) you )?(?:please )?(?:summari[sz]e|give me) (?:the )?(?:key )?points(?: please)?$/.test(normalizedMessage)) {
    return 'summarise';
  }
  if (/^(?:(?:can|could|would) you )?(?:please )?(?:summari[sz]e|give me a summary of) (?:this|that|it|the concept)(?: please)?$/.test(normalizedMessage)) {
    return 'summarise';
  }
  if (
    /^(?:(?:can|could|would) you )?(?:please )?(?:why is (?:this|that|it) important|why does (?:this|that|it) matter)(?:\?)?$/.test(normalizedMessage)
    || /^(?:(?:can|could|would) you )?(?:please )?(?:elaborate|tell me more|explain that differently)(?: please)?$/.test(normalizedMessage)
  ) {
    return 'explain';
  }
  return null;
}

function getActiveConcept(conversationHistory, conceptList) {
  for (let index = conversationHistory.length - 1; index > conceptList.historyIndex; index -= 1) {
    const message = conversationHistory[index];
    if (!(message?.sender === 'user' || message?.role === 'learner')) continue;
    const selectedConcept = findConceptSelection(message.content || '', conceptList);
    if (selectedConcept) return selectedConcept;
  }

  return null;
}

export function resolveLearningTurn(message, conversationHistory) {
  const conceptList = getRecentModuleConceptList(conversationHistory);
  if (!conceptList) return { message, context: {} };

  const selectedConcept = findConceptSelection(message, conceptList);
  if (selectedConcept) {
    return {
      message: selectedConcept.name,
      actionType: 'explain',
      context: {
        moduleNumber: conceptList.moduleNumber,
        moduleName: conceptList.moduleTitle,
        restrictToModule: true
      }
    };
  }

  const followUpIntent = getFollowUpIntent(message);
  if (followUpIntent) {
    const activeConcept = getActiveConcept(conversationHistory, conceptList);
    if (!activeConcept) {
      return {
        message,
        needsConceptSelection: true,
        moduleTitle: conceptList.moduleTitle,
        context: {
          moduleNumber: conceptList.moduleNumber,
          moduleName: conceptList.moduleTitle,
          restrictToModule: true
        }
      };
    }

    return {
      message: `${activeConcept.name}. ${message}`,
      actionType: followUpIntent,
      context: {
        moduleNumber: conceptList.moduleNumber,
        moduleName: conceptList.moduleTitle,
        restrictToModule: true
      }
    };
  }

  const activeConcept = getActiveConcept(conversationHistory, conceptList);
  if (activeConcept) {
    return {
      message: `${activeConcept.name}. ${message}`,
      context: {
        moduleNumber: conceptList.moduleNumber,
        moduleName: conceptList.moduleTitle,
        restrictToModule: true
      }
    };
  }

  return {
    message,
    needsConceptSelection: true,
    moduleTitle: conceptList.moduleTitle,
    context: {
      moduleNumber: conceptList.moduleNumber,
      moduleName: conceptList.moduleTitle,
      restrictToModule: true
    }
  };
}

import { AssistantContext, ChatMessage } from '../types/assistant';

const DATABASE_NAME = 'estudy-ai-assistant';
const DATABASE_VERSION = 1;
const CONVERSATION_STORE = 'conversations';
const METADATA_STORE = 'metadata';
const ACTIVE_CONVERSATION_KEY = 'activeConversationId';

export interface SavedConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  context: AssistantContext;
  messages: ChatMessage[];
}

export interface ConversationState {
  conversations: SavedConversation[];
  activeConversationId: string | null;
}

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('This browser does not support local conversation storage.'));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CONVERSATION_STORE)) {
        database.createObjectStore(CONVERSATION_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open conversation storage.'));
    request.onblocked = () => reject(new Error('Conversation storage is blocked by another open application tab.'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not read conversation storage.'));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Conversation storage transaction failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('Conversation storage transaction was aborted.'));
  });
}

export async function loadConversationState(): Promise<ConversationState> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([CONVERSATION_STORE, METADATA_STORE], 'readonly');
    const completion = transactionComplete(transaction);
    const conversationsRequest = requestResult(
      transaction.objectStore(CONVERSATION_STORE).getAll() as IDBRequest<SavedConversation[]>
    );
    const activeIdRequest = requestResult(
      transaction.objectStore(METADATA_STORE).get(ACTIVE_CONVERSATION_KEY) as IDBRequest<string | undefined>
    );
    const [conversations, activeConversationId] = await Promise.all([
      conversationsRequest,
      activeIdRequest,
      completion
    ]);
    conversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    return { conversations, activeConversationId: activeConversationId || null };
  } finally {
    database.close();
  }
}

export async function saveConversationState(
  conversations: SavedConversation[],
  activeConversationId: string
): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([CONVERSATION_STORE, METADATA_STORE], 'readwrite');
    const completion = transactionComplete(transaction);
    const store = transaction.objectStore(CONVERSATION_STORE);
    for (const conversation of conversations) store.put(conversation);
    transaction.objectStore(METADATA_STORE).put(activeConversationId, ACTIVE_CONVERSATION_KEY);
    await completion;
  } finally {
    database.close();
  }
}

export async function deleteConversationRecord(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(CONVERSATION_STORE, 'readwrite');
    const completion = transactionComplete(transaction);
    transaction.objectStore(CONVERSATION_STORE).delete(id);
    await completion;
  } finally {
    database.close();
  }
}

export function createConversation(context: AssistantContext = {}): SavedConversation {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: 'New conversation',
    createdAt: now,
    updatedAt: now,
    context,
    messages: []
  };
}

export function getConversationTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((message) => message.sender === 'user');
  if (!firstUserMessage) return 'New conversation';
  return firstUserMessage.content.trim().replace(/\s+/g, ' ').slice(0, 48) || 'New conversation';
}

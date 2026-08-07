/**
 * Atlas History Service
 * Handles loading, saving, and clearing the active chat session (currently sessionStorage).
 * Prepares structure for persisting conversation history in the future (e.g. Firebase).
 */

const ACTIVE_SESSION_KEY = "travio_atlas_messages";
const HISTORY_KEY = "travio_atlas_history";

/**
 * Get default initial welcome message for Atlas.
 */
export function getDefaultWelcomeMessage() {
  return [
    {
      id: 1,
      sender: "ai",
      text: "Hi! I'm Atlas.\n\nI'm here to help you discover destinations, answer travel questions, and guide you throughout Travio.\n\nHow can I help today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}

/**
 * Gets the active conversation session messages.
 */
export function getActiveSessionMessages() {
  try {
    const saved = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    return saved ? JSON.parse(saved) : getDefaultWelcomeMessage();
  } catch (e) {
    console.error("Failed to read active session messages from sessionStorage:", e);
    return getDefaultWelcomeMessage();
  }
}

/**
 * Saves the active conversation session messages.
 */
export function saveActiveSessionMessages(messages) {
  try {
    sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error("Failed to save active session messages to sessionStorage:", e);
  }
}

/**
 * Clears the active conversation session messages.
 */
export function clearActiveSession() {
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear active session messages:", e);
  }
}

/**
 * ==============================================================
 * FUTURE PERSISTENCE ARCHITECTURE (FIREBASE / CLOUD STORAGE STUBS)
 * ==============================================================
 * 
 * In the future, to sync with Firebase/Firestore:
 * 1. Implement saveConversationToCloud(userId, sessionId, messages)
 * 2. Implement getConversationHistoryFromCloud(userId)
 * 3. Call saveActiveSessionToHistory() when a conversation completes, 
 *    or auto-save on every message send/receive.
 */

/**
 * Saves a completed session into historical logs.
 * Can be hooked up to Firebase/Firestore in the future.
 * 
 * @param {string} userId - The authenticated user's ID.
 * @param {Array} messages - The list of messages in the session.
 */
export async function saveConversationToHistory(userId, messages) {
  if (!userId || !messages || messages.length <= 1) return;

  // For future Firebase implementation:
  // import { db } from "../firebase/firebase";
  // import { collection, addDoc, serverTimestamp } from "firebase/firestore";
  // await addDoc(collection(db, `users/${userId}/atlas_history`), {
  //   messages,
  //   timestamp: serverTimestamp(),
  // });

  // For now: stub using localStorage so it's mock-implemented but separated
  try {
    const savedHistory = localStorage.getItem(`${HISTORY_KEY}_${userId}`);
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    const newSessionEntry = {
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      messages: messages
    };
    
    history.push(newSessionEntry);
    localStorage.setItem(`${HISTORY_KEY}_${userId}`, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save conversation to history:", e);
  }
}

/**
 * Retrieves the list of past conversations (history).
 * Can be hooked up to Firebase/Firestore in the future.
 * 
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<Array>} - List of historical conversations.
 */
export async function getConversationHistory(userId) {
  if (!userId) return [];

  // For future Firebase implementation:
  // import { db } from "../firebase/firebase";
  // import { collection, getDocs, orderBy, query } from "firebase/firestore";
  // const q = query(collection(db, `users/${userId}/atlas_history`), orderBy("timestamp", "desc"));
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  try {
    const savedHistory = localStorage.getItem(`${HISTORY_KEY}_${userId}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (e) {
    console.error("Failed to get conversation history:", e);
    return [];
  }
}

/**
 * Clears all historical conversations.
 * 
 * @param {string} userId - The authenticated user's ID.
 */
export async function clearConversationHistory(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(`${HISTORY_KEY}_${userId}`);
  } catch (e) {
    console.error("Failed to clear conversation history:", e);
  }
}

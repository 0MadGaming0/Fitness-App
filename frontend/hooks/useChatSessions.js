/**
 * useChatSessions.js
 * Manages multiple named chat sessions, persisted to localStorage.
 * Each session: { id, title, messages, pinned, createdAt, updatedAt }
 */
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'fitai_chats';
const CURRENT_KEY = 'fitai_current_chat';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveToStorage(sessions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }
  catch {} // ignore quota errors
}

export function useChatSessions() {
  const [sessions, setSessions] = useState(loadFromStorage);

  // Validate stored currentId still exists
  const [currentId, setCurrentId] = useState(() => {
    const saved = localStorage.getItem(CURRENT_KEY);
    const all = loadFromStorage();
    return all.some((s) => s.id === saved) ? saved : null;
  });

  const currentSession = sessions.find((s) => s.id === currentId) || null;

  /** Create a new session and switch to it. Returns the new id. */
  const createSession = useCallback((initialMessages = []) => {
    const id = generateId();
    const session = {
      id,
      title: 'New Chat',
      messages: initialMessages,
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => {
      const updated = [session, ...prev];
      saveToStorage(updated);
      return updated;
    });
    localStorage.setItem(CURRENT_KEY, id);
    setCurrentId(id);
    return id;
  }, []);

  /**
   * Persist updated messages to a session.
   * Pass sessionId explicitly to avoid stale closure issues.
   */
  const updateMessages = useCallback((messages, sessionId) => {
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== sessionId) return s;
        // Auto-derive title from first real user message
        const firstUser = messages.find((m) => m.role === 'user');
        const raw = firstUser?.content || '';
        const title = raw ? raw.slice(0, 52) + (raw.length > 52 ? '…' : '') : s.title;
        return { ...s, messages, title, updatedAt: Date.now() };
      });
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Switch the active session. */
  const switchSession = useCallback((id) => {
    localStorage.setItem(CURRENT_KEY, id);
    setCurrentId(id);
  }, []);

  /** Toggle pin on a session. */
  const togglePin = useCallback((id) => {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  /** Delete a session, auto-switching away if it was active. */
  const deleteSession = useCallback((id) => {
    const all = loadFromStorage();
    const remaining = all.filter((s) => s.id !== id);
    saveToStorage(remaining);
    setSessions(remaining);
    // Switch away if this was the active session
    setCurrentId((prev) => {
      if (prev !== id) return prev;
      const next = remaining[0];
      if (next) { localStorage.setItem(CURRENT_KEY, next.id); return next.id; }
      localStorage.removeItem(CURRENT_KEY);
      return null;
    });
  }, []);

  return {
    sessions,
    currentId,
    currentSession,
    createSession,
    updateMessages,
    switchSession,
    togglePin,
    deleteSession,
  };
}

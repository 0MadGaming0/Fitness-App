/**
 * AICoach.jsx — ChatGPT-like AI fitness coach with persistent, named chat history.
 * Sessions are stored in localStorage and restored on navigation.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, Copy, RefreshCw, Zap, User,
  Plus, Pin, Trash2, MessageSquare, PanelLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { askAICoach } from '../services/aiService';
import { useChatSessions } from '../hooks/useChatSessions';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';

// ─── Constants ────────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  'Create a 4-day workout split for muscle gain',
  'What should I eat before and after workouts?',
  'How do I break through a training plateau?',
  'Build a beginner home workout routine',
  'Best exercises for losing belly fat',
  'How many rest days do I need per week?',
];

function makeWelcome(user) {
  return {
    role: 'assistant',
    _isWelcome: true,
    content: `👋 Hey${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm your **FitAI Coach**.\n\nI know your goal is **"${user?.goal || 'getting fit'}"** and I'm here to help. Ask me anything about:\n\n- 💪 Workout plans & exercises\n- 🥗 Nutrition & meal planning\n- 😴 Recovery & rest optimization\n- 📈 Progress strategies\n\nWhat would you like to work on today?`,
  };
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-white" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="typing-dots flex items-center gap-1 h-4">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────
function ChatMessage({ msg, onCopy, onRegenerate, isLast }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10'
          : 'bg-gradient-to-br from-violet-600 to-cyan-500'
        }
      `}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>
      <div className={`max-w-[80%] group relative ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-violet-600/15 border border-violet-500/20 text-[var(--text-primary)] rounded-tr-sm'
            : 'glass border border-[var(--glass-border)] text-[var(--text-secondary)] rounded-tl-sm chat-markdown'
          }
        `}>
          {isUser
            ? <p>{msg.content}</p>
            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          }
        </div>
        {!isUser && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(msg.content)}
              className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Copy size={11} /> Copy
            </button>
            {isLast && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-violet-400 transition-colors"
              >
                <RefreshCw size={11} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── SessionItem ──────────────────────────────────────────────────────────────
function SessionItem({ session, isActive, onSwitch, onPin, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSwitch(session.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 10px', borderRadius: '10px', cursor: 'pointer',
        background: isActive ? 'rgba(124,58,237,0.15)' : hovered ? 'var(--hover-bg)' : 'transparent',
        border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
        transition: 'all 0.15s', marginBottom: '2px',
      }}
    >
      <MessageSquare size={13} color={isActive ? '#a78bfa' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
      <span style={{
        flex: 1, fontSize: '13px', lineHeight: 1.4,
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: isActive ? 500 : 400,
      }}>
        {session.title}
      </span>

      {/* Hover actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onPin(session.id)}
              title={session.pinned ? 'Unpin' : 'Pin'}
              style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'var(--hover-bg)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: session.pinned ? '#a78bfa' : 'var(--text-muted)',
              }}
            >
              <Pin size={11} />
            </button>
            <button
              onClick={() => onDelete(session.id)}
              title="Delete chat"
              style={{
                width: '22px', height: '22px', borderRadius: '6px',
                background: 'var(--hover-bg)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Trash2 size={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SessionsPanel ────────────────────────────────────────────────────────────
function SessionsPanel({ sessions, currentId, onNew, onSwitch, onPin, onDelete }) {
  const pinned  = sessions.filter((s) => s.pinned);
  const recents = sessions.filter((s) => !s.pinned);

  const SectionLabel = ({ label }) => (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '8px 10px 4px',
    }}>
      {label}
    </p>
  );

  return (
    <div style={{
      width: '260px', height: '100%', flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* New Chat */}
      <div style={{ padding: '16px 12px 10px' }}>
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={onNew}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: '12px',
            background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.1))',
            border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <Plus size={14} /> New Chat
        </motion.button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 16px' }}>
        {/* Pinned */}
        {pinned.length > 0 && (
          <div style={{ marginBottom: '4px' }}>
            <SectionLabel label="Pinned" />
            {pinned.map((s) => (
              <SessionItem key={s.id} session={s} isActive={s.id === currentId}
                onSwitch={onSwitch} onPin={onPin} onDelete={onDelete} />
            ))}
          </div>
        )}

        {/* Recents */}
        {recents.length > 0 && (
          <div>
            <SectionLabel label={pinned.length > 0 ? 'Recents' : 'Chats'} />
            {recents.map((s) => (
              <SessionItem key={s.id} session={s} isActive={s.id === currentId}
                onSwitch={onSwitch} onPin={onPin} onDelete={onDelete} />
            ))}
          </div>
        )}

        {sessions.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '32px 12px' }}>
            No chats yet.<br />Start a conversation!
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AICoach() {
  const { user, loading: authLoading } = useAuth();
  const {
    sessions, currentId, currentSession,
    createSession, updateMessages, switchSession, togglePin, deleteSession,
  } = useChatSessions();

  const [messages,      setMessagesState] = useState([]);
  const [input,         setInput]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [showSessions,  setShowSessions]  = useState(() => window.innerWidth >= 900);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const messagesRef    = useRef([]);
  const currentIdRef   = useRef(currentId);

  // Keep currentIdRef in sync
  useEffect(() => { currentIdRef.current = currentId; }, [currentId]);

  // Restore messages from localStorage whenever the active session changes
  useEffect(() => {
    if (!currentId) return;
    try {
      const all = JSON.parse(localStorage.getItem('fitai_chats') || '[]');
      const sess = all.find((s) => s.id === currentId);
      if (sess) {
        setMessagesState(sess.messages);
        messagesRef.current = sess.messages;
      }
    } catch {}
  }, [currentId]);

  // If no active session (first visit or all deleted), create one once auth loads
  useEffect(() => {
    if (authLoading || !user || currentId) return;
    const welcome = makeWelcome(user);
    createSession([welcome]);
    setMessagesState([welcome]);
    messagesRef.current = [welcome];
  }, [authLoading, user, currentId, createSession]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── helpers ────────────────────────────────────────────────────────────────
  const setMessages = useCallback((updaterOrValue) => {
    setMessagesState((prev) => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      messagesRef.current = next;
      return next;
    });
  }, []);

  const persist = useCallback((msgs) => {
    if (currentIdRef.current) updateMessages(msgs, currentIdRef.current);
  }, [updateMessages]);

  // ── actions ────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    if (!user) return;
    const welcome = makeWelcome(user);
    createSession([welcome]);
    setMessagesState([welcome]);
    messagesRef.current = [welcome];
  }, [user, createSession]);

  const handleDelete = useCallback((id) => {
    deleteSession(id);
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0 && user) {
      setTimeout(() => {
        const welcome = makeWelcome(user);
        createSession([welcome]);
        setMessagesState([welcome]);
        messagesRef.current = [welcome];
      }, 30);
    }
  }, [deleteSession, sessions, user, createSession]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;
    setInput('');

    const userMsg    = { role: 'user', content: message };
    const withUser   = [...messagesRef.current, userMsg];
    setMessages(withUser);
    persist(withUser);   // persist immediately so user message survives navigation
    setLoading(true);

    const history = withUser
      .filter((m) => !m._isWelcome)
      .map(({ role, content }) => ({ role, content }));

    try {
      const { data } = await askAICoach({
        goal:   user?.goal   || 'general fitness',
        age:    user?.age    || 'unknown',
        weight: user?.weight || 'unknown',
        history,
      });
      const withAI = [...messagesRef.current, { role: 'assistant', content: data.advice }];
      setMessages(withAI);
      persist(withAI);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errMsg);
      const withErr = [...messagesRef.current, {
        role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.',
      }];
      setMessages(withErr);
      persist(withErr);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRegenerate = async () => {
    const lastUser = [...messagesRef.current].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const trimmed = messagesRef.current.slice(0, -1);
    setMessages(trimmed);
    persist(trimmed);
    await sendMessage(lastUser.content);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const showSuggestions = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <PageTransition>
      <div className="flex bg-[var(--bg-app)] text-[var(--text-primary)]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        {/* Sessions sidebar */}
        <AnimatePresence initial={false}>
          {showSessions && (
            <motion.div
              key="sessions-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', flexShrink: 0, height: '100%', minWidth: 0 }}
            >
              <SessionsPanel
                sessions={sessions}
                currentId={currentId}
                onNew={handleNewChat}
                onSwitch={switchSession}
                onPin={togglePin}
                onDelete={handleDelete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {/* Header */}
          <div className="glass border-b border-[var(--glass-border)] px-4 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowSessions((v) => !v)}
                title="Toggle chat history"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: showSessions ? 'rgba(124,58,237,0.15)' : 'var(--input-bg)',
                  border: showSessions ? '1px solid rgba(124,58,237,0.25)' : '1px solid var(--input-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: showSessions ? '#a78bfa' : 'var(--text-secondary)',
                }}
              >
                <PanelLeft size={16} />
              </motion.button>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center pulse-glow">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[var(--text-primary)]">FitAI Coach</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-[var(--text-muted)]">Online · Ready to help</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleNewChat}
                title="New chat"
                style={{
                  marginLeft: 'auto',
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0,
                }}
              >
                <Plus size={15} />
              </motion.button>

              {user && (
                <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  {user.goal   && <span className="glass px-3 py-1.5 rounded-full border border-violet-500/20 text-violet-400">{user.goal}</span>}
                  {user.weight && <span>{user.weight} kg</span>}
                  {user.age    && <span>{user.age} yrs</span>}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    msg={msg}
                    onCopy={handleCopy}
                    onRegenerate={handleRegenerate}
                    isLast={i === messages.length - 1}
                  />
                ))}
              </AnimatePresence>
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested prompts */}
          <AnimatePresence>
            {showSuggestions && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-4 sm:px-6 w-full flex-shrink-0"
                style={{ maxWidth: '1200px', margin: '0 auto 16px auto' }}
              >
                <p className="text-xs text-[var(--text-muted)] mb-3">Suggested prompts</p>
                <div className="flex flex-wrap gap-2.5">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-xs px-3.5 py-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-violet-500/30 transition-all duration-200"
                      style={{ cursor: 'pointer' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="glass border-t border-[var(--glass-border)] chat-input-panel flex-shrink-0">
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about fitness, nutrition, or recovery..."
                    rows={1}
                    className="w-full px-5 py-3.5 pr-12 rounded-2xl text-sm bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-text)] placeholder-[var(--text-muted)] outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all resize-none max-h-32"
                    style={{ height: 'auto', minHeight: '50px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <div className="absolute right-3.5 bottom-3.5 text-xs text-[var(--text-muted)]">⏎</div>
                </div>
                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition-all duration-200 flex-shrink-0"
                  style={{ height: '50px', width: '50px', cursor: 'pointer' }}
                >
                  {loading
                    ? <Zap size={18} className="text-white animate-pulse" />
                    : <Send size={16} className="text-white" />
                  }
                </motion.button>
              </div>
              <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
                AI advice is for informational purposes. Always consult a professional for medical guidance.
              </p>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </PageTransition>
  );
}

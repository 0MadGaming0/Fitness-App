/**
 * AICoach.jsx — ChatGPT-like AI fitness coaching interface
 * Sends messages to /ai-coach endpoint with user profile context.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Copy, RefreshCw, Zap, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { askAICoach } from '../services/aiService';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';

const SUGGESTED_PROMPTS = [
  'Create a 4-day workout split for muscle gain',
  'What should I eat before and after workouts?',
  'How do I break through a training plateau?',
  'Build a beginner home workout routine',
  'Best exercises for losing belly fat',
  'How many rest days do I need per week?',
];

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

function ChatMessage({ msg, onCopy, onRegenerate, isLast }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10'
          : 'bg-gradient-to-br from-violet-600 to-cyan-500'
        }
      `}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`
        max-w-[80%] group relative
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-violet-600/25 border border-violet-500/20 text-slate-200 rounded-tr-sm'
            : 'glass border border-white/08 text-slate-300 rounded-tl-sm chat-markdown'
          }
        `}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action buttons for AI messages */}
        {!isUser && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(msg.content)}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Copy size={11} /> Copy
            </button>
            {isLast && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-violet-400 transition-colors"
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

export default function AICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Welcome message
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `👋 Hey${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm your **FitAI Coach**, powered by Llama 3.3.\n\nI know your goal is **"${user?.goal || 'getting fit'}"** and I'm here to help. Ask me anything about:\n\n- 💪 Workout plans & exercises\n- 🥗 Nutrition & meal planning\n- 😴 Recovery & rest optimization\n- 📈 Progress strategies\n\nWhat would you like to work on today?`,
    }]);
  }, [user]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await askAICoach({
        goal: user?.goal || 'general fitness',
        age: user?.age || 25,
        weight: user?.weight || 70,
        message: message,
      });

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.advice,
      }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(errMsg);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;
    // Remove last assistant message and resend
    setMessages((prev) => prev.slice(0, -1));
    await sendMessage(lastUserMsg.content);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <PageTransition>
      <div className="flex bg-[#050508]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="glass border-b border-white/06 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center pulse-glow">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">FitAI Coach</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Online · Powered by Llama 3.3</span>
                </div>
              </div>
              {user && (
                <div className="ml-auto hidden sm:flex items-center gap-4 text-xs text-slate-500">
                  {user.goal && <span className="glass px-3 py-1.5 rounded-full border border-violet-500/20 text-violet-400">{user.goal}</span>}
                  {user.weight && <span>{user.weight} kg</span>}
                  {user.age && <span>{user.age} yrs</span>}
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
                style={{ maxWidth: '1200px', margin: '0 auto 24px auto' }}
              >
                <p className="text-xs text-slate-600 mb-3">Suggested prompts</p>
                <div className="flex flex-wrap gap-2.5">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="
                        text-xs px-3.5 py-2 rounded-xl
                        glass border border-white/08
                        text-slate-400 hover:text-white hover:border-violet-500/30
                        transition-all duration-200
                      "
                      style={{ cursor: 'pointer' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="glass border-t border-white/06 chat-input-panel flex-shrink-0">
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
                    className="
                      w-full px-5 py-3.5 pr-12 rounded-2xl text-sm
                      bg-white/[0.04] border border-white/10
                      text-white placeholder-slate-600
                      outline-none focus:border-violet-500/50
                      focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]
                      transition-all resize-none max-h-32
                    "
                    style={{ height: 'auto', minHeight: '50px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 text-xs text-slate-600">
                    <span>⏎</span>
                  </div>
                </div>

                <motion.button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    w-12 h-12 rounded-2xl
                    bg-gradient-to-br from-violet-600 to-cyan-500
                    hover:opacity-90
                    disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center justify-center
                    shadow-[0_4px_14px_rgba(124,58,237,0.4)]
                    transition-all duration-200 flex-shrink-0
                  "
                  style={{ height: '50px', width: '50px', cursor: 'pointer' }}
                >
                  {loading
                    ? <Zap size={18} className="text-white animate-pulse" />
                    : <Send size={16} className="text-white" />
                  }
                </motion.button>
              </div>
              <p className="text-center text-[11px] text-slate-600 mt-2">
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

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Dumbbell, Award, Flame, Calendar,
  Sparkles, CheckCircle2, AlertTriangle, Lightbulb, ShieldAlert,
  Send, Bot, User, RefreshCw, PanelRightOpen, X, PlayCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { getExerciseById, getExercises, askExerciseCoach } from '../services/exerciseService';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';

export default function ExerciseGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Chat States
  const [showAIChat, setShowAIChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Video States
  const [playing, setPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setPlaying(false);
        const res = await getExerciseById(id);
        setExercise(res.data);

        // Fetch other exercises to extract alternative objects
        const listRes = await getExercises();
        const altNames = res.data.alternatives || [];
        const matchedAlts = listRes.data.filter(ex => 
          altNames.some(name => name.toLowerCase() === ex.name.toLowerCase())
        );
        setAlternatives(matchedAlts);

        // Preset AI Welcome message
        setMessages([
          {
            role: 'assistant',
            content: `👋 Hi! I'm your **FitAI Exercise Coach**. Ask me anything about **${res.data.name}**! For example:\n\n- What is the correct setup form?\n- How do I keep my elbows from locking out?\n- What are some bodyweight alternatives to this?`
          }
        ]);

      } catch (err) {
        console.error('Failed to load exercise details:', err);
        toast.error('Exercise details not found');
        navigate('/exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  // Scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  // Handle Send AI message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || aiLoading) return;

    setInputMessage('');
    const userMsg = { role: 'user', content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setAiLoading(true);

    try {
      const res = await askExerciseCoach({
        exerciseId: id,
        message: text,
        history: nextMsgs.slice(1, -1) // pass history excluding system/welcome
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      console.error('AI chat failed:', err);
      toast.error('Failed to get response from AI coach');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[var(--bg-app)] h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-violet-600/30 border-t-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <PageTransition>
      <div className="flex bg-[var(--bg-app)] h-[100dvh] overflow-hidden font-sans text-white">
        <Sidebar />

        <div className="flex-1 flex overflow-hidden">
          {/* Main detailed guide scroll area */}
          <main className="flex-1 overflow-y-auto mobile-nav-clearance p-6 md:p-10">
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Top Back Action Header */}
              <div className="flex items-center justify-between">
                <Link
                  to="/exercises"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Library
                </Link>
                <button
                  onClick={() => setShowAIChat(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-600/20 transition-colors"
                >
                  <Sparkles size={14} /> Ask AI Coach
                </button>
              </div>

              {/* Title & Recommendations Header Card */}
              <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/06">
                <div className="absolute w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] -top-10 -right-10 pointer-events-none" />
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-violet-600/25 border border-violet-500/30 text-violet-300 text-[10px] font-black uppercase tracking-wider">
                    {exercise.category}
                  </span>
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                    ${exercise.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                    ${exercise.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                    ${exercise.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                  `}>
                    {exercise.difficulty}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                  {exercise.name}
                </h1>

                {/* Target details stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/05">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/03 border border-white/06 flex items-center justify-center">
                      <Flame className="text-orange-400" size={16} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Est. Calories</p>
                      <p className="text-white text-sm font-black">{exercise.caloriesEstimate || '250'} kcal/hr</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/03 border border-white/06 flex items-center justify-center">
                      <Dumbbell className="text-violet-400" size={16} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Equipment</p>
                      <p className="text-white text-sm font-black truncate max-w-[120px]" title={exercise.equipment}>{exercise.equipment}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/03 border border-white/06 flex items-center justify-center">
                      <Calendar className="text-cyan-400" size={16} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Recommended</p>
                      <p className="text-white text-sm font-black">{exercise.recommendedSets || '3'} Sets</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/03 border border-white/06 flex items-center justify-center">
                      <Award className="text-pink-400" size={16} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Target Reps</p>
                      <p className="text-white text-sm font-black">{exercise.recommendedReps || '12'} Reps</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Player Section */}
              <div className="glass rounded-3xl overflow-hidden border border-white/06 aspect-video relative bg-slate-950 flex items-center justify-center">
                {!playing ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    {exercise.thumbnailUrl && (
                      <img
                        src={exercise.thumbnailUrl}
                        alt="Video Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" />
                    <button
                      onClick={() => setPlaying(true)}
                      className="relative w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all scale-100 hover:scale-110 cursor-pointer shadow-[0_0_30px_rgba(124,58,237,0.5)] z-20"
                    >
                      <Play size={24} className="fill-current ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                        <div className="w-8 h-8 rounded-full border-4 border-violet-600/30 border-t-violet-400 animate-spin" />
                      </div>
                    )}
                    {exercise.videoUrl ? (
                      <iframe
                        src={`${exercise.videoUrl}?autoplay=1&rel=0&modestbranding=1`}
                        title={exercise.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setVideoLoading(false)}
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 p-6">
                        <PlayCircle size={48} className="text-slate-600 mb-2" />
                        <p className="text-sm font-bold text-slate-400">Demo video unavailable</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Target Muscles */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-6 border border-white/06 flex flex-col justify-between">
                  <h3 className="font-extrabold text-white mb-3 text-base flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                    Primary Target Muscles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.primaryMuscles.map((muscle) => (
                      <span key={muscle} className="px-3.5 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold text-xs">
                        {muscle}
                      </span>
                    ))}
                  </div>

                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Secondary Assist Muscles</h4>
                      <div className="flex flex-wrap gap-2">
                        {exercise.secondaryMuscles.map((muscle) => (
                          <span key={muscle} className="px-3.5 py-1.5 rounded-xl bg-white/03 border border-white/05 text-slate-400 font-bold text-xs">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Front/Back Body map placeholder */}
                <div className="glass rounded-3xl p-6 border border-white/06 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-2">Anatomical Muscle Map</p>
                  <div className="relative w-40 h-28 opacity-40 hover:opacity-60 transition-opacity">
                    {/* Visual Vector Silhouette */}
                    <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/30 via-transparent to-transparent absolute rounded-full filter blur-xl" />
                    <svg className="w-full h-full text-slate-500" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,15 A8,8 0 1,0 50,31 A8,8 0 1,0 50,15 Z M42,35 L42,60 L45,60 L45,90 L55,90 L55,60 L58,60 L58,35 Z" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1">Highlighted regions indicate stress load</span>
                </div>
              </div>

              {/* Numbered Steps Instructions */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={20} />
                  Step-by-Step Instructions
                </h2>
                <div className="flex flex-col gap-3.5">
                  {exercise.instructions.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/04 hover:border-white/08 transition-all"
                    >
                      <div className="w-7 h-7 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 text-xs font-black">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" size={20} />
                  ⚠️ Common Mistakes to Avoid
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {exercise.commonMistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-red-500/05 border border-red-500/15 flex gap-3 text-red-400 text-xs md:text-sm font-semibold"
                    >
                      <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
                      <p className="leading-relaxed">{mistake}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              <div>
                <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="text-amber-400 animate-pulse" size={20} />
                  💡 Pro Tips for Execution
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {exercise.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-500/05 border border-amber-500/15 flex gap-3 text-amber-300 text-xs md:text-sm font-semibold"
                    >
                      <Lightbulb className="flex-shrink-0 mt-0.5" size={16} />
                      <p className="leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              {alternatives.length > 0 && (
                <div>
                  <h2 className="text-xl font-extrabold text-white mb-4">Alternatives & Variations</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {alternatives.map((alt) => (
                      <Link key={alt._id} to={`/exercises/${alt._id}`} className="block">
                        <motion.div
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/05 hover:border-white/12 text-center transition-all cursor-pointer"
                        >
                          <p className="font-extrabold text-sm text-white mb-1.5">{alt.name}</p>
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                            {alt.difficulty} • {alt.category}
                          </span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Notes */}
              <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/04 text-slate-500 text-xs leading-relaxed max-w-2xl">
                <span className="font-black text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Medical & Safety Disclaimer</span>
                Warm up thoroughly before loading weights. If you experience sharp, localized, or shooting pain at any point, stop immediately. Maintain spinal neutrality throughout heavy compound setups. If in doubt, query our AI Coach in the sidebar or check with a certified local trainer.
              </div>

            </div>
          </main>

          {/* AI Exercise Coach Floating/Side Drawer */}
          <AnimatePresence>
            {showAIChat && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-90 border-l border-white/08 bg-slate-950 flex flex-col h-[100dvh] relative z-50 flex-shrink-0"
              >
                {/* Header title */}
                <div className="p-4 border-b border-white/06 flex items-center justify-between flex-shrink-0 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">FitAI Exercise Coach</h3>
                      <p className="text-[10px] text-slate-500">Form & Performance guide</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="p-1.5 rounded-lg bg-white/03 hover:bg-white/08 text-slate-400 hover:text-white border border-white/05 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Messages feed scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={i} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold ${isUser ? 'bg-slate-700' : 'bg-gradient-to-br from-violet-600 to-cyan-500'}`}>
                          {isUser ? <User size={12} /> : <Bot size={12} />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${isUser ? 'bg-violet-600/15 border border-violet-500/20 text-white rounded-tr-none' : 'bg-white/03 border border-white/06 text-slate-300 rounded-tl-none chat-markdown'}`}>
                          {isUser ? <p>{msg.content}</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>}
                        </div>
                      </div>
                    );
                  })}
                  {aiLoading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white">
                        <Bot size={12} />
                      </div>
                      <div className="bg-white/03 border border-white/06 rounded-2xl rounded-tl-none px-3.5 py-2">
                        <div className="typing-dots flex items-center gap-1 h-3">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input action */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/06 flex gap-2 bg-slate-900/30 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Ask AI about this form..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-white/03 border border-white/06 focus:border-violet-500 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white cursor-pointer disabled:opacity-55"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        <MobileNav />
      </div>
    </PageTransition>
  );
}

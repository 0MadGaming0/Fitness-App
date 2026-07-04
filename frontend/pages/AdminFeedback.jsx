import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Compass } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import toast from 'react-hot-toast';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  
  // Reply management states
  const [replyTexts, setReplyTexts] = useState({});
  const [submittingReplies, setSubmittingReplies] = useState({});

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        // GET /feedback/all from auth.py developer endpoint
        const res = await api.get('/feedback/all');
        setFeedbacks(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load feedbacks panel');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const handleSendReply = async (fbId) => {
    const text = (replyTexts[fbId] || '').trim();
    if (!text) {
      toast.error('Please write a reply message first!');
      return;
    }

    try {
      setSubmittingReplies((prev) => ({ ...prev, [fbId]: true }));
      await api.post(`/feedback/${fbId}/reply`, { reply: text });
      
      // Update local state to reflect the new reply instantly
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((item) =>
          item._id === fbId ? { ...item, reply: text, replied_at: new Date().toISOString() } : item
        )
      );

      toast.success('Reply submitted successfully! 💬');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit reply');
    } finally {
      setSubmittingReplies((prev) => ({ ...prev, [fbId]: false }));
    }
  };

  const handleToggleFeatured = async (fbId) => {
    try {
      const res = await api.post(`/feedback/${fbId}/feature`);
      const newStatus = res.data.featured;
      
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((item) =>
          item._id === fbId ? { ...item, featured: newStatus } : item
        )
      );

      toast.success(newStatus ? 'Featured on landing page! 🌟' : 'Hidden from landing page.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update feature status');
    }
  };

  // Compute stats
  const totalCount = feedbacks.length;
  const avgRating = totalCount > 0 
    ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1)
    : '0.0';

  const bugCount = feedbacks.filter(f => f.type === 'Bug Report').length;
  const suggestCount = feedbacks.filter(f => f.type === 'Feature Suggestion').length;
  const praiseCount = feedbacks.filter(f => f.type === 'Praise & Love').length;

  const filtered = filterType === 'All'
    ? feedbacks
    : feedbacks.filter(f => f.type === filterType);

  const getCategoryColor = (type) => {
    switch (type) {
      case 'Bug Report':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Feature Suggestion':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'UI/UX Suggestion':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    }
  };

  return (
    <PageTransition>
      <div className="flex bg-[var(--bg-app)]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance font-sans text-white">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Compass className="text-violet-400" size={16} />
                <span className="text-xs uppercase font-bold tracking-widest text-violet-400">Reserved Owner Console</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">User Feedbacks</h1>
              <p className="text-xs text-slate-500 mt-1">
                Monitor rating metrics, bug reports, and features submitted by the FitAI community.
              </p>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-3xl p-5 border border-white/05 relative overflow-hidden">
                <div className="absolute w-24 h-24 bg-violet-600/10 rounded-full blur-2xl -top-5 -right-5" />
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Feedbacks</p>
                <p className="text-3xl font-black text-white mt-1.5">{totalCount}</p>
              </div>

              <div className="glass rounded-3xl p-5 border border-white/05 relative overflow-hidden">
                <div className="absolute w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -top-5 -right-5" />
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg rating</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <p className="text-3xl font-black text-white">{avgRating}</p>
                  <span className="text-xs text-amber-400">★</span>
                </div>
              </div>

              <div className="glass rounded-3xl p-5 border border-white/05 relative overflow-hidden">
                <div className="absolute w-24 h-24 bg-red-600/10 rounded-full blur-2xl -top-5 -right-5" />
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Bugs reported</p>
                <p className="text-3xl font-black text-red-400 mt-1.5">{bugCount}</p>
              </div>

              <div className="glass rounded-3xl p-5 border border-white/05 relative overflow-hidden">
                <div className="absolute w-24 h-24 bg-cyan-600/10 rounded-full blur-2xl -top-5 -right-5" />
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Features suggested</p>
                <p className="text-3xl font-black text-cyan-400 mt-1.5">{suggestCount}</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 border-b border-white/05">
              {['All', 'Praise & Love', 'Bug Report', 'Feature Suggestion', 'UI/UX Suggestion'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`
                    px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border flex-shrink-0
                    ${filterType === type 
                      ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/25' 
                      : 'bg-white/03 hover:bg-white/08 border-white/06 text-slate-400 hover:text-white'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Feedbacks List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 shimmer rounded-3xl bg-white/[0.02]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl p-10 border border-white/05">
                <MessageSquare size={48} className="text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No Feedback Entries</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  No user has submitted feedback matching this filter category.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((fb, idx) => (
                  <motion.div
                    key={fb._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass rounded-3xl p-6 border border-white/05 relative overflow-hidden group hover:border-white/10 transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{fb.email}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[11px] text-slate-400 font-bold">
                            {fb.created_at ? new Date(fb.created_at).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        
                        {/* Stars */}
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, starIdx) => (
                            <Star
                              key={starIdx}
                              size={12}
                              className={starIdx < (fb.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleFeatured(fb._id)}
                          className={`
                            px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer flex items-center gap-1
                            ${fb.featured
                              ? 'bg-amber-400/10 text-amber-400 border-amber-400/25 shadow-[0_0_12px_rgba(251,191,36,0.15)]'
                              : 'bg-white/03 hover:bg-white/08 text-slate-500 hover:text-slate-300 border-white/06'
                            }
                          `}
                        >
                          <Star size={10} className={fb.featured ? 'fill-current text-amber-400' : ''} />
                          {fb.featured ? 'Featured on Landing' : 'Show on Landing'}
                        </button>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(fb.type)}`}>
                          {fb.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed italic bg-white/[0.01] p-4 rounded-2xl border border-white/03">
                      "{fb.comment}"
                    </p>

                    {/* Replies section */}
                    <div className="mt-4 pt-4 border-t border-white/05 flex flex-col gap-3">
                      {fb.reply ? (
                        <div className="bg-violet-500/05 border border-violet-500/15 p-3.5 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Owner Response</span>
                            {fb.replied_at && (
                              <>
                                <span className="text-[9px] text-slate-600">•</span>
                                <span className="text-[10px] text-slate-500">{new Date(fb.replied_at).toLocaleString()}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-violet-200 leading-relaxed">
                            {fb.reply}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={2}
                            placeholder="Type a response to this user..."
                            value={replyTexts[fb._id] || ''}
                            onChange={(e) => setReplyTexts({ ...replyTexts, [fb._id]: e.target.value })}
                            className="
                              w-full bg-white/03 border border-white/08 focus:border-violet-500
                              rounded-xl p-2.5 text-xs text-white placeholder-slate-500 outline-none
                              resize-none transition-all
                            "
                          />
                          <button
                            onClick={() => handleSendReply(fb._id)}
                            disabled={submittingReplies[fb._id] || !(replyTexts[fb._id] || '').trim()}
                            className="
                              self-end px-4 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 disabled:opacity-40
                              disabled:pointer-events-none text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer
                            "
                          >
                            {submittingReplies[fb._id] ? 'Sending...' : 'Send Response'}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </div>
        </main>
        
        <MobileNav />
      </div>
    </PageTransition>
  );
}

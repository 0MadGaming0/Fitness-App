import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dumbbell, Award, Layers, Sparkles, Filter, ChevronRight, Check } from 'lucide-react';
import { getExercises, seedExercises } from '../services/exerciseService';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import toast from 'react-hot-toast';

export default function Exercises() {
  const location = useLocation();
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  });
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  // Load and auto-seed if empty, stale, or missing v2 data (fixed video URLs)
  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoading(true);
        const res = await getExercises();
        const needsReseed =
          res.data.length < 20 ||
          !res.data.some((e) => e.dataVersion === 8);
        if (needsReseed) {
          // Drop duplicates + insert 24-exercise library with fixed video URLs
          await seedExercises();
          const reFetched = await getExercises();
          setExercises(reFetched.data);
        } else {
          setExercises(res.data);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
        toast.error('Failed to load exercises library');
      } finally {
        setLoading(false);
      }
    };
    loadExercises();
  }, []);



  // Filter local logic for instant search feeling
  const filtered = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscles.some(m => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === '' || ex.category === category;
    const matchesDifficulty = difficulty === '' || ex.difficulty === difficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <PageTransition>
      <div className="flex bg-[var(--bg-app)]" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Header Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="text-violet-400" size={16} />
                <span className="text-xs uppercase font-bold tracking-widest text-violet-400">Learn Proper Form</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">Exercise Guides</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                Browse our premium library of step-by-step form tutorials, muscle maps, mistakes to avoid, and custom tips.
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-[2] relative flex items-center">
                <Search size={18} className="text-slate-400 absolute left-5 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by exercise name, target muscle, or equipment..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  className="w-full bg-white/03 border border-white/06 focus:border-violet-500 rounded-full py-4 pr-6 text-base font-semibold text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 flex-1">
                <div className="relative flex items-center flex-1">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-white/03 border border-white/06 hover:border-white/10 rounded-full py-4 pl-6 pr-12 text-sm font-bold text-slate-300 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">All Categories</option>
                    <option value="Strength" className="bg-slate-900 text-white">Strength</option>
                    <option value="Core" className="bg-slate-900 text-white">Core</option>
                    <option value="Cardio" className="bg-slate-900 text-white">Cardio</option>
                    <option value="Mobility" className="bg-slate-900 text-white">Mobility</option>
                  </select>
                  <Filter size={15} className="text-slate-500 absolute right-6 pointer-events-none" />
                </div>

                <div className="relative flex items-center flex-1">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full appearance-none bg-white/03 border border-white/06 hover:border-white/10 rounded-full py-4 pl-6 pr-12 text-sm font-bold text-slate-300 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-white">All Levels</option>
                    <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
                    <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
                    <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
                  </select>
                  <Award size={13} className="text-slate-500 absolute right-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 shimmer rounded-3xl bg-white/[0.03]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 font-sans glass rounded-3xl p-10 border border-white/05">
                <Dumbbell size={48} className="text-slate-700 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-white mb-1">No Exercises Found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  Try adjusting your search filters or check your keywords.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filtered.map((ex, idx) => (
                    <motion.div
                      key={ex._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="group relative flex flex-col justify-between bg-white/[0.02] border border-white/06 hover:border-white/12 rounded-3xl overflow-hidden transition-all duration-300"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-44 overflow-hidden bg-slate-900 flex-shrink-0">
                        {ex.thumbnailUrl ? (
                          <img
                            src={ex.thumbnailUrl}
                            alt={ex.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-violet-950/10">
                            <Dumbbell size={32} className="text-violet-500/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                        
                        {/* Tags over image */}
                        <div className="absolute bottom-3 left-4 flex gap-1.5">
                          <span className={`
                            px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider
                            ${ex.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                            ${ex.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
                            ${ex.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : ''}
                          `}>
                            {ex.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/08 text-slate-300 text-[9px] font-black uppercase tracking-wider border border-white/10">
                            {ex.category}
                          </span>
                        </div>
                      </div>

                      {/* Details Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-white text-base group-hover:text-violet-400 transition-colors">
                            {ex.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {ex.primaryMuscles.map((muscle) => (
                              <span key={muscle} className="px-2 py-0.5 rounded-lg bg-violet-600/10 text-violet-300 text-[10px] font-bold border border-violet-500/10">
                                {muscle}
                              </span>
                            ))}
                            {ex.secondaryMuscles?.map((muscle) => (
                              <span key={muscle} className="px-2 py-0.5 rounded-lg bg-white/03 text-slate-400 text-[10px] font-bold border border-white/05">
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/04 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {ex.equipment}
                          </span>
                          <Link to={`/exercises/${ex._id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-violet-600/25"
                            >
                              Learn Form
                              <ChevronRight size={11} />
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>
    </PageTransition>
  );
}

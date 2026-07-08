/**
 * Workouts.jsx — Full CRUD workout management with search, filter, pagination
 */
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useActiveWorkout } from '../context/ActiveWorkoutContext';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import PageTransition from '../components/layout/PageTransition';
import Button from '../components/ui/Button';
import WorkoutCard from '../components/workout/WorkoutCard';
import WorkoutForm from '../components/workout/WorkoutForm';
import DeleteConfirmModal from '../components/workout/DeleteConfirmModal';
import { SkeletonCard } from '../components/ui/Skeleton';

const ITEMS_PER_PAGE = 9;

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Chest', value: 'chest' },
  { label: 'Legs', value: 'legs' },
  { label: 'Back', value: 'back' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Arms', value: 'arms' },
];

export default function Workouts() {
  const { workouts, loading, fetchWorkouts, createWorkout, editWorkout, removeWorkout } = useWorkouts();
  const { startWorkout } = useActiveWorkout();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);
  useEffect(() => { setPage(1); }, [search, filter]);

  // Filter + search
  const filtered = useMemo(() => {
    return workouts.filter((w) => {
      const matchSearch = w.exercise?.toLowerCase().includes(search.toLowerCase());
      let matchFilter = true;
      if (filter !== 'all') {
        const e = w.exercise?.toLowerCase() || '';
        if (filter === 'chest')     matchFilter = e.includes('bench') || e.includes('chest') || e.includes('push');
        if (filter === 'legs')      matchFilter = e.includes('squat') || e.includes('leg') || e.includes('lunge');
        if (filter === 'back')      matchFilter = e.includes('pull') || e.includes('row') || e.includes('back') || e.includes('lat');
        if (filter === 'cardio')    matchFilter = e.includes('run') || e.includes('cardio') || e.includes('cycle');
        if (filter === 'shoulders') matchFilter = e.includes('shoulder') || e.includes('press') || e.includes('ohp');
        if (filter === 'arms')      matchFilter = e.includes('curl') || e.includes('tricep') || e.includes('bicep');
      }
      return matchSearch && matchFilter;
    });
  }, [workouts, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAdd = () => { setEditData(null); setFormOpen(true); };
  const handleEdit = (w) => { setEditData(w); setFormOpen(true); };
  const handleDeleteClick = (w) => { setDeleteTarget(w); setDeleteOpen(true); };

  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    let ok;
    if (editData) {
      ok = await editWorkout(editData.id, data);
    } else {
      ok = await createWorkout(data);
    }
    setSubmitting(false);
    if (ok) setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    await removeWorkout(deleteTarget.id);
    setSubmitting(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[var(--bg-app)]">
        <Sidebar />

        <main className="flex-1 overflow-y-auto mobile-nav-clearance">
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px 80px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <Dumbbell className="text-violet-400" size={22} />
                  Workouts
                </h1>
                <p className="text-slate-500 text-sm mt-1">{workouts.length} total workouts logged</p>
              </div>
              <Button variant="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                Add Workout
              </Button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search workouts..."
                  className="
                    w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                    bg-white/[0.03] border border-white/08
                    text-white placeholder-slate-600
                    outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.15)]
                    transition-all
                  "
                  style={{ paddingLeft: '40px', paddingRight: '16px' }}
                />
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setShowMobileFilters((v) => !v)}
                className="
                  flex sm:hidden items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-white/5 border border-white/10 text-slate-300 hover:text-white
                  transition-all text-sm font-semibold cursor-pointer
                "
              >
                <Filter size={15} className={showMobileFilters ? 'text-violet-400' : 'text-slate-500'} />
                <span>Filters: <span className="text-violet-400 capitalize">{filter}</span></span>
              </button>

              {/* Desktop Filters (Always visible) / Mobile Filters (Collapsible) */}
              <div 
                className={`
                  ${showMobileFilters ? 'flex' : 'hidden'} 
                  sm:flex items-center gap-2.5 flex-wrap
                `}
              >
                <span className="hidden sm:inline-flex items-center">
                  <Filter size={14} className="text-slate-500 mr-1" />
                </span>
                {FILTER_OPTIONS.map((f) => {
                  const isSelected = filter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => {
                        setFilter(f.value);
                        setShowMobileFilters(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        background: isSelected 
                          ? 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '1px solid rgba(255, 255, 255, 0.2)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                        outline: 'none',
                      }}
                      onMouseOver={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = '#f8fafc';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.color = '#94a3b8';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        }
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginated.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Dumbbell size={36} className="text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {search || filter !== 'all' ? 'No matching workouts' : 'No workouts yet'}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  {search || filter !== 'all' ? 'Try a different search or filter' : 'Log your first workout to get started'}
                </p>
                {!search && filter === 'all' && (
                  <Button variant="primary" icon={<Plus size={16} />} onClick={handleAdd}>
                    Add First Workout
                  </Button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginated.map((workout, i) => (
                    <WorkoutCard
                      key={workout.id || i}
                      workout={workout}
                      index={i}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onStart={(w) => startWorkout(w.exercise, w.sets, w.reps, w.weight || 40)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl glass hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${page === i + 1
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-500 hover:text-white glass hover:bg-white/10'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl glass hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>

        <MobileNav />

        {/* Modals */}
        <WorkoutForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          editData={editData}
          loading={submitting}
        />
        <DeleteConfirmModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={submitting}
          workoutName={deleteTarget?.exercise}
        />
      </div>
    </PageTransition>
  );
}

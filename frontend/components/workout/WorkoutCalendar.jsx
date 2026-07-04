import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalendar } from '../../services/workoutService';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, CalendarRange, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchCal = async () => {
      try {
        const res = await getCalendar();
        setCalendarData(res.data);
      } catch (err) {
        console.error('Failed to load calendar statuses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCal();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Handle day click details
  const handleDayClick = (dayNum) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    const status = calendarData[dateStr] || 'rest';
    setSelectedDay({
      dateStr,
      status
    });
  };

  return (
    <div className="bg-white/[0.02] border border-white/06 rounded-2xl p-5 font-sans">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
          <CalendarRange className="text-violet-400" size={18} />
          Workout History Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-white/05 text-slate-400 hover:text-white border border-white/06 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs md:text-sm font-bold text-white min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-white/05 text-slate-400 hover:text-white border border-white/06 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-violet-600/30 border-t-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-[10px] uppercase font-bold text-slate-500 py-1">{d}</div>
          ))}

          {/* Blank offsets for start day index */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`offset-${idx}`} className="p-3" />
          ))}

          {/* Days numbers */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const status = calendarData[dateStr] || 'rest';

            // Color coding classes (Feature 9)
            let colorClass = 'bg-white/03 border-white/05 text-slate-400 hover:bg-white/05'; // Rest Day
            if (status === 'completed') {
              colorClass = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30';
            } else if (status === 'in_progress' || status === 'planned') {
              colorClass = 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30';
            } else if (status === 'skipped') {
              colorClass = 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30';
            }

            return (
              <motion.button
                key={`day-${dayNum}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDayClick(dayNum)}
                className={`
                  p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center aspect-square
                  ${colorClass}
                `}
              >
                <span>{dayNum}</span>
                {/* Micro indicators */}
                {status === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 block" />}
                {status === 'skipped' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 block" />}
                {(status === 'in_progress' || status === 'planned') && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 block" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Selected Day Details Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-5 p-4 rounded-xl border bg-white/[0.02] border-white/08 flex flex-col gap-2 font-sans"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Clock size={12} className="text-slate-500" />
                Date: {selectedDay.dateStr}
              </span>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-500 hover:text-slate-300 text-[10px] font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              {selectedDay.status === 'completed' && (
                <>
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <span className="text-sm font-bold text-white">Workout Session Completed! 🎉</span>
                </>
              )}
              {selectedDay.status === 'skipped' && (
                <>
                  <AlertTriangle className="text-red-400" size={18} />
                  <span className="text-sm font-bold text-white">Workout Session Skipped ⚠️</span>
                </>
              )}
              {(selectedDay.status === 'planned' || selectedDay.status === 'in_progress') && (
                <>
                  <CalendarRange className="text-amber-400" size={18} />
                  <span className="text-sm font-bold text-white">Planned Workout Scheduled ⚡</span>
                </>
              )}
              {selectedDay.status === 'rest' && (
                <>
                  <span className="text-lg">🧘</span>
                  <span className="text-sm font-bold text-slate-400">Rest / Recovery Day</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Guide Legends */}
      <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/06 justify-center">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/30 block" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/30 block" />
          <span>Planned</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded bg-red-500/20 border border-red-500/30 block" />
          <span>Skipped / Missed</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded bg-white/03 border border-white/05 block" />
          <span>Rest Day</span>
        </div>
      </div>
    </div>
  );
}

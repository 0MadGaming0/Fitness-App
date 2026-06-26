/**
 * WorkoutHeatmap.jsx — GitHub-style workout activity heatmap (last 16 weeks)
 */
import { motion } from 'framer-motion';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getIntensityClass(count) {
  if (count === 0) return 'bg-white/[0.04]';
  if (count === 1) return 'bg-violet-900/60';
  if (count === 2) return 'bg-violet-700/70';
  if (count === 3) return 'bg-violet-600/80';
  return 'bg-violet-500';
}

export default function WorkoutHeatmap({ workouts = [] }) {
  // Build a map of date → count
  const countByDate = {};
  workouts.forEach((w) => {
    if (!w.created_at) return;
    const d = new Date(w.created_at).toISOString().split('T')[0];
    countByDate[d] = (countByDate[d] || 0) + 1;
  });

  // Generate last 16 weeks of dates
  const today = new Date();
  const weeks = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (16 * 7 - 1));

  for (let w = 0; w < 16; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().split('T')[0];
      days.push({
        date: key,
        count: countByDate[key] || 0,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    weeks.push(days);
  }

  // Determine month labels
  const monthLabels = weeks.map((week) => {
    const firstDay = new Date(week[0].date);
    return firstDay.getDate() <= 7 ? MONTHS[firstDay.getMonth()] : '';
  });

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Month labels */}
        <div className="flex gap-1 ml-8 mb-1">
          {monthLabels.map((m, i) => (
            <div key={i} className="w-4 text-[9px] text-slate-600 text-center">{m}</div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map((d, i) => (
              <div key={i} className="w-6 h-4 text-[9px] text-slate-600 flex items-center justify-end pr-1">
                {i % 2 === 1 ? d.slice(0, 1) : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.002, duration: 0.2 }}
                  title={`${day.label}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                  className={`
                    heatmap-cell w-4 h-4 rounded-sm cursor-pointer
                    transition-all duration-200
                    ${getIntensityClass(day.count)}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-[10px] text-slate-600">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3.5 h-3.5 rounded-sm ${getIntensityClass(level)}`}
            />
          ))}
          <span className="text-[10px] text-slate-600">More</span>
        </div>
      </div>
    </div>
  );
}

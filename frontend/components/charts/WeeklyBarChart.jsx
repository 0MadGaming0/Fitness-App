/**
 * WeeklyBarChart.jsx — Bar chart for weekly workout frequency
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 border border-white/10 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-violet-400 font-semibold">{payload[0].value} workouts</p>
    </div>
  );
};

export default function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="workouts" radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.workouts > 0
                ? `url(#barGradient)`
                : 'rgba(255,255,255,0.04)'
              }
            />
          ))}
        </Bar>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

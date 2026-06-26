/**
 * CaloriesLineChart.jsx — Calories burned line chart
 */
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 border border-white/10 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-pink-400 font-semibold">{payload[0].value} kcal</p>
    </div>
  );
};

export default function CaloriesLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f472b6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
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
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(244,114,182,0.2)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="calories"
          stroke="url(#lineGlow)"
          strokeWidth={2.5}
          dot={{ fill: '#f472b6', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#f9a8d4', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

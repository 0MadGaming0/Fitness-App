/**
 * MonthlyAreaChart.jsx — Monthly workout progress area chart
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 border border-white/10 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-cyan-400 font-semibold">{payload[0].value} workouts</p>
    </div>
  );
};

export default function MonthlyAreaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="week"
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
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(6,182,212,0.2)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="workouts"
          stroke="#06b6d4"
          strokeWidth={2.5}
          fill="url(#areaGradient)"
          dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#22d3ee', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

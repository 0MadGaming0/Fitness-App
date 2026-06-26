/**
 * WeightLineChart.jsx — Weight progress over time
 */
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 border border-white/10 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-green-400 font-semibold">{payload[0].value} kg</p>
    </div>
  );
};

export default function WeightLineChart({ data, targetWeight }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="rgba(6,182,212,0.5)"
            strokeDasharray="4 4"
            label={{ value: `Target: ${targetWeight}kg`, fill: '#64748b', fontSize: 10 }}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#34d399"
          strokeWidth={2.5}
          fill="url(#weightGradient)"
          dot={{ fill: '#34d399', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6ee7b7', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * WorkoutPieChart.jsx — Workout distribution donut chart
 */
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#7c3aed', '#06b6d4', '#60a5fa', '#f472b6', '#fb923c', '#34d399'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 border border-white/10 text-sm">
      <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}
      </p>
      <p className="text-slate-400">{payload[0].value} sessions</p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        <span className="text-xs text-slate-400">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function WorkoutPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
              opacity={0.85}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

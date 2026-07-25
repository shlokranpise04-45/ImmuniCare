

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 
const COLORS = {
  Completed: '#2F6F5E', // --stamp-teal
  Upcoming: '#B5822E',  // --stamp-gold
  Overdue: '#B23A2E',   // --stamp-red
};
 
export default function VaccineChart({ status }) {
  const data = [
    { name: 'Completed', value: status.completed.length },
    { name: 'Upcoming', value: status.upcoming.length },
    { name: 'Overdue', value: status.overdue.length },
  ].filter(d => d.value > 0);
 
  if (data.length === 0) {
    return <p className="empty-state">No vaccine data yet.</p>;
  }
 
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#FAF6EC',
            border: '1px solid #DCD0AF',
            borderRadius: 6,
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
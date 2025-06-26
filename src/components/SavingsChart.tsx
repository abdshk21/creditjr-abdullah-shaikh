
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SavingsChartProps {
  data: Array<{
    name: string;
    saved: number;
    goal: number;
  }>;
}

const SavingsChart = ({ data }: SavingsChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number, name: string) => [
            `${value} د.إ`, 
            name === 'saved' ? 'Saved' : 'Goal'
          ]}
        />
        <Bar dataKey="goal" fill="#e5e7eb" name="Goal" />
        <Bar dataKey="saved" name="Saved">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.saved < 0 ? "#ef4444" : "#10b981"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SavingsChart;

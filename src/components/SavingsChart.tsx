
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';

interface SavingsChartProps {
  actualSavings: number;
  savingsGoal: number;
}

const SavingsChart = ({ actualSavings, savingsGoal }: SavingsChartProps) => {
  const data = [
    {
      name: 'Goal',
      value: savingsGoal,
      type: 'goal'
    },
    {
      name: 'Saved',
      value: actualSavings,
      type: 'saved'
    }
  ];

  const getBarColor = (entry: any) => {
    if (entry.type === 'goal') return '#d1d5db'; // Gray for goal
    return entry.value >= 0 ? '#4caf50' : '#f44336'; // Green for positive, red for negative
  };

  // Calculate dynamic domain to ensure both positive and negative values are visible
  const minValue = Math.min(0, actualSavings);
  const maxValue = Math.max(savingsGoal, actualSavings);
  const padding = Math.max(50, Math.abs(maxValue - minValue) * 0.1);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[minValue - padding, maxValue + padding]} />
          <ReferenceLine y={0} stroke="#666" strokeWidth={2} strokeDasharray="2 2" />
          <Tooltip formatter={(value) => [`د.إ${Number(value).toFixed(2)}`, 'Amount']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsChart;

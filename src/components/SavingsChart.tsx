
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

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
    return entry.value >= 0 ? '#22c55e' : '#ef4444'; // Green for positive, red for negative
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
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

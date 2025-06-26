import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import FloatingAddButton from '@/components/FloatingAddButton';

const MyScorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Fetch transactions for the current month
  const { data: monthlyTransactions, isLoading: isTransactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['monthlyTransactions', user?.id, firstDayOfMonth, lastDayOfMonth],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(firstDayOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(lastDayOfMonth, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data;
    },
  });

  // Fetch user's goals
  const { data: goals, isLoading: isGoalsLoading, error: goalsError } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching goals:', error);
        return null;
      }

      return data;
    },
  });

  const income = monthlyTransactions?.filter(t => t.type === 'income') || [];
  const expenses = monthlyTransactions?.filter(t => t.type === 'expense') || [];

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpenses;

  const calculateScore = () => {
    let score = 50; // Start with a base score

    // Increase score for saving
    if (savings > 0) {
      score += 20;
    }

    // Increase score if expenses are below 80% of income
    if (totalExpenses < 0.8 * totalIncome) {
      score += 15;
    }

    // Increase score if savings goal is set
     if (goals?.monthly_saving_goal) {
          score += 15;
      }

    // Reduce score if expenses exceed income
    if (totalExpenses > totalIncome) {
      score -= 30;
    }

    // Reduce score if no transactions added
    if (!monthlyTransactions?.length) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score)); // Ensure score is within 0-100 range
  };

  const score = calculateScore();

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[#102c54] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-[#102c54]">My Score</h1>
        </div>

        {/* Score Display */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-5xl font-bold text-center text-[#102c54]">{score} / 100</div>
            <Progress value={score} className="mt-4 h-4" />
            <div className="mt-4 text-center text-sm text-gray-600">
              {score >= 70
                ? 'Great job! Keep up the excellent financial habits.'
                : score >= 40
                  ? 'Good progress! There\'s room for improvement. Set some goals!'
                  : 'Needs attention. Start tracking your expenses and set a budget.'}
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span>Income</span>
              <span className="font-bold text-green-600">+ د.إ{totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Expenses</span>
              <span className="font-bold text-red-600">- د.إ{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Savings</span>
              <span className="font-bold text-[#102c54]">د.إ{savings.toFixed(2)}</span>
            </div>
            {goals?.monthly_saving_goal && (
              <div className="flex justify-between items-center">
                <span>Savings Goal</span>
                <span className="font-bold text-[#102c54]">د.إ{goals.monthly_saving_goal.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {monthlyTransactions?.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{transaction.description || transaction.category}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(transaction.date), 'PPP')}
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'} د.إ{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {monthlyTransactions?.length === 0 && (
              <div className="text-center text-gray-600">No transactions this month.</div>
            )}
          </CardContent>
        </Card>
      </div>
      <FloatingAddButton />
    </div>
  );
};

export default MyScorePage;

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingDown, TrendingUp, Target, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SavingsChart from '@/components/SavingsChart';
import FloatingAddButton from '@/components/FloatingAddButton';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [monthlyBudget, setMonthlyBudget] = useState(0);

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthEnd = endOfMonth(new Date());

  // Fetch user's monthly saving goal
  const { data: goals } = useQuery({
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
    enabled: !!user?.id,
  });

  // Fetch user's transactions for the current month
  const { data: monthlyExpenses, refetch: refetchMonthlyExpenses } = useQuery({
    queryKey: ['monthlyExpenses', user?.id, currentMonthStart, currentMonthEnd],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(currentMonthStart, 'yyyy-MM-dd'))
        .lte('date', format(currentMonthEnd, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching monthly expenses:', error);
        return [];
      }

      return data as Expense[];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // Fetch the latest transactions when the component mounts or user changes
    refetchMonthlyExpenses();
  }, [user, refetchMonthlyExpenses]);

  // Calculate total expenses for the current month
  const totalSpent = monthlyExpenses
    ? monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    : 0;

  // Calculate remaining budget
  const remainingBudget = goals ? goals.income_expectation - totalSpent : 0;

  // Calculate budget progress percentage
  const budgetProgress = goals ? (totalSpent / goals.income_expectation) * 100 : 0;

   // Calculate actual savings (income - expenses)
  const actualSavings = goals ? goals.income_expectation - totalSpent : 0;

  const chartData = [
    {
      name: 'This Month',
      saved: actualSavings,
      goal: goals?.monthly_saving_goal || 0
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#102c54] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-300">
              Welcome back, {user?.email || 'User'}!
            </p>
          </div>
          <Button onClick={() => navigate('/set-goal')} className="bg-[#d8a434] hover:bg-[#d8a434]/90 text-white">
            Set Goals
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Allowance</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ{goals?.income_expectation || 0}</div>
            <p className="text-sm text-gray-100">Your monthly income</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ{totalSpent.toFixed(2)}</div>
            <p className="text-sm text-gray-100">This month's expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">د.إ{remainingBudget.toFixed(2)}</div>
            <p className="text-sm text-gray-100">Funds left to spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card className="shadow-md border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {budgetProgress > 100 ? 'Over Budget' : 'Budget Used'}
                </span>
                <span className="text-gray-700">{budgetProgress.toFixed(1)}%</span>
              </div>
              <Progress value={budgetProgress} className="h-3" />
              <p className="text-sm text-gray-500">
                You have د.إ{remainingBudget.toFixed(2)} remaining from your د.إ{goals?.income_expectation} monthly allowance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="p-6 space-y-6">
        {/* Savings Progress Chart */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Savings Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SavingsChart data={chartData} />
            <div className="mt-4 text-center text-sm text-gray-600">
              {actualSavings < 0 
                ? `You're د.إ${Math.abs(actualSavings).toFixed(2)} behind your savings goal this month`
                : actualSavings === 0
                ? "Start saving to see your progress!"
                : `Great! You've saved د.إ${actualSavings.toFixed(2)} this month`
              }
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {monthlyExpenses && monthlyExpenses.length > 0 ? (
              <div className="space-y-4">
                {monthlyExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{expense.description}</h3>
                      <p className="text-sm text-gray-500">{expense.category} - {format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <p className="text-red-600 font-bold">-د.إ{expense.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">No transactions this month.</p>
              </div>
            )}
            <Button onClick={() => navigate('/transaction-history')} variant="secondary" className="w-full mt-4">
              View All Transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      <FloatingAddButton />
    </div>
  );
};

export default Dashboard;

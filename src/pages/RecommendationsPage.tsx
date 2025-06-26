
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb, Target, DollarSign, ArrowLeft, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subDays, isWithinInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import FloatingAddButton from '@/components/FloatingAddButton';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch transactions for the last 30 days
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions-recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data;
    },
  });

  // Fetch user's goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals-recommendations', user?.id],
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

  // Calculate total income and expenses
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  // Identify top spending categories
  const categorySpending = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const topCategory = sortedCategories[0]?.[0];
  const topCategoryAmount = sortedCategories[0]?.[1];

  // Calculate potential savings if top category spending was reduced by 10%
  const potentialSavings = topCategoryAmount ? topCategoryAmount * 0.1 : 0;

  // Determine if user is meeting their savings goal
  const savingsGoal = goals?.monthly_saving_goal || 0;
  const actualSavings = totalIncome - totalExpenses;
  const isMeetingGoal = actualSavings >= savingsGoal;

  // Calculate days left in the month
  const today = new Date();
  const endOfMonthDate = endOfMonth(today);
  const daysLeft = Math.ceil((endOfMonthDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  // Generate personalized recommendations
  let recommendations = [];

  if (!goals) {
    recommendations.push("Set a monthly savings goal to start tracking your progress.");
  } else {
    if (topCategory) {
      recommendations.push(`Consider reducing spending in ${topCategory} by د.إ${potentialSavings.toFixed(2)} to save more.`);
    }
    if (!isMeetingGoal) {
      recommendations.push(`You are not currently meeting your savings goal. Try to save an extra د.إ${(savingsGoal - actualSavings).toFixed(2)} this month.`);
    }
  }

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
          <h1 className="text-3xl font-bold text-[#102c54]">Recommendations</h1>
        </div>

        {/* Summary Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Financial Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">د.إ{totalIncome.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">د.إ{totalExpenses.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">د.إ{savingsGoal.toFixed(2)}</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Recommendations Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recommendations.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500">
                No recommendations available at this time. Keep tracking your transactions!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Status Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Savings Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Savings Progress:</div>
              <div className="text-lg font-bold">د.إ{actualSavings.toFixed(2)} / د.إ{savingsGoal.toFixed(2)}</div>
            </div>
            <Progress value={(actualSavings / savingsGoal) * 100} />
            {isMeetingGoal ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                You are on track to meet your savings goal!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                You are not currently meeting your savings goal.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Days Left in Month Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Left This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-center">
              {daysLeft} days
            </div>
            <p className="text-center text-gray-500">remaining in the month</p>
          </CardContent>
        </Card>
      </div>
      <FloatingAddButton />
    </div>
  );
};

export default RecommendationsPage;

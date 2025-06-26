import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp, Target, Plus, CalendarDays, Award, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Goal {
  monthly_saving_goal: number;
  income_expectation: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      return data as Expense[];
    },
    enabled: !!user?.id,
  });

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
      
      return data as Goal;
    },
    enabled: !!user?.id,
  });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(transaction => {
    const expenseDate = new Date(transaction.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const monthlyAllowance = goals?.income_expectation || totalIncome || 0;
  const savingsGoal = goals?.monthly_saving_goal || 0;

  const remainingBudget = monthlyAllowance - totalSpent;
  const budgetProgress = (totalSpent / monthlyAllowance) * 100;

  const categoryTotals = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const recentExpenses = transactions.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      {/* Floating Add Transaction Button */}
      <Button
        onClick={() => navigate('/add-transaction')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Gradient Background */}
        <div className="bg-gradient-to-r from-[#102c54] via-[#1e3a72] to-[#2d4f8a] rounded-lg p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 w-12 h-12 rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/ce9c86db-4914-4c0d-8753-b431569de422.png" 
                  alt="Tyche Online Academy" 
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">CreditJr</h1>
                  <p className="text-white/80">By Tyche Online Academy</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all"
                  onClick={() => navigate('/my-account')}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-account')}
                  className="text-white hover:bg-white/10 w-10 h-10 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => supabase.auth.signOut()}
                className="text-white hover:bg-white/10 w-10 h-10 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#102c54] mb-6">Your Financial Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Allowance</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{monthlyAllowance.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{remainingBudget.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetProgress.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Spending</span>
                  <span>د.إ{totalSpent.toFixed(2)} / د.إ{monthlyAllowance.toFixed(2)}</span>
                </div>
                <Progress 
                  value={budgetProgress} 
                  className="h-3"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {remainingBudget > 0 
                  ? `You have د.إ${remainingBudget.toFixed(2)} left this month!`
                  : `You're د.إ${Math.abs(remainingBudget).toFixed(2)} over budget this month.`
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryTotals).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">د.إ{amount.toFixed(2)}</span>
                  </div>
                ))}
                {Object.keys(categoryTotals).length === 0 && (
                  <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                  </div>
                  <span className="font-bold text-red-600">
                    {expense.type === 'expense' ? '-د.إ' : '+د.إ'}
                    {expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {recentExpenses.length === 0 && (
                <p className="text-sm text-muted-foreground">No transactions yet. Start by adding an expense!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

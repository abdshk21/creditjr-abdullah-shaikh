
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, DollarSign, TrendingUp, TrendingDown, Target, UtensilsCrossed, ShoppingBag, Gamepad2, Car, BookOpen, Briefcase, PiggyBank } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
  user_id: string;
}

interface CreditScore {
  score: number;
  breakdown: any;
  last_calculated: string;
}

interface Goal {
  monthly_saving_goal: number;
  max_spend_limit: number;
  category_limits: any;
  income_expectation: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Fetch transactions for current month
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id, currentMonth, currentYear],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  // Fetch credit score
  const { data: creditScore } = useQuery({
    queryKey: ['creditScore', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('credit_score')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching credit score:', error);
        return null;
      }
      
      return data as CreditScore;
    },
    enabled: !!user?.id,
  });

  // Fetch goals
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

  // Calculate metrics
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const monthlyAllowance = goals?.income_expectation || 0;
  const maxSpendLimit = goals?.max_spend_limit || monthlyAllowance;

  // Get category icons
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Food & Dining': UtensilsCrossed,
      'Food': UtensilsCrossed,
      'Shopping': ShoppingBag,
      'Entertainment': Gamepad2,
      'Transportation': Car,
      'Education': BookOpen,
      'Work': Briefcase,
      'Allowance': PiggyBank,
      'Payday': DollarSign,
    };
    return iconMap[category] || DollarSign;
  };

  // Calculate top spending categories
  const categorySpending = expenseTransactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);

  const topSpendingCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Calculate top income sources
  const incomeSourceSpending = incomeTransactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);

  const topIncomeSources = Object.entries(incomeSourceSpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Credit score helpers
  const getCreditScoreLabel = (score: number) => {
    if (score >= 740) return 'Good';
    if (score >= 670) return 'Average';
    return 'Needs Work';
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 740) return 'bg-green-500';
    if (score >= 670) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#102c54] mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Your financial overview for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Monthly Allowance */}
          <Card className="bg-[#d8a434] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Monthly Allowance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyAllowance.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Income Earned */}
          <Card className="bg-green-500 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Income Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Spent So Far */}
          <Card className="bg-red-500 text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Spent So Far
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* Virtual Credit Score */}
          <Card className="bg-[#102c54] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{creditScore?.score || 650}</div>
                <div className="text-sm opacity-90">{getCreditScoreLabel(creditScore?.score || 650)}</div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getCreditScoreColor(creditScore?.score || 650)}`}
                    style={{ width: `${((creditScore?.score || 650) - 300) / 550 * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Spending Categories */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#102c54] flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSpendingCategories.length > 0 ? (
                  topSpendingCategories.map(([category, amount], index) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category}</p>
                            <p className="text-sm text-gray-500">#{index + 1} category</p>
                          </div>
                        </div>
                        <span className="font-bold text-red-600">${amount.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No expenses recorded this month</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Income Sources */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#102c54] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Income Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIncomeSources.length > 0 ? (
                  topIncomeSources.map(([category, amount], index) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category}</p>
                            <p className="text-sm text-gray-500">#{index + 1} source</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No income recorded this month</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Add Button */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#d8a434] hover:bg-[#d8a434]/90 shadow-lg z-50"
          onClick={() => window.location.href = '/add-transaction'}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

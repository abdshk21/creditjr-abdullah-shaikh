import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, DollarSign, TrendingUp, TrendingDown, Target, UtensilsCrossed, ShoppingBag, Gamepad2, Car, BookOpen, Briefcase, PiggyBank, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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

// Semi-circle gauge component
const SemiCircleGauge = ({ score, size = 150 }: { score: number; size?: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 740) return '#22c55e'; // green
    if (score >= 670) return '#3b82f6'; // blue
    if (score >= 580) return '#eab308'; // yellow
    if (score >= 500) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 740) return 'EXCELLENT';
    if (score >= 670) return 'GOOD';
    if (score >= 580) return 'FAIR';
    return 'POOR';
  };

  const radius = size / 2 - 15;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score - 300) / 550 * circumference;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + 30} className="transform rotate-0">
        {/* Background arc */}
        <path
          d={`M 15 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 15} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M 15 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 15} ${size / 2}`}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-white">
          {score}
        </div>
        <div className="text-xs font-medium text-white/90">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Gradient Background */}
        <div className="bg-gradient-to-r from-[#102c54] via-[#1e3a72] to-[#2d4f8a] rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/ce9c86db-4914-4c0d-8753-b431569de422.png" 
                alt="Tyche Online Academy" 
                className="w-16 h-16 rounded-full border-2 border-white/20"
              />
              <div>
                <h1 className="text-4xl font-bold text-white">CreditJr</h1>
                <p className="text-lg text-white/80">By Tyche Online Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all"
                  onClick={() => navigate('/my-account')}
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-account')}
                  className="text-white hover:bg-white/10 w-12 h-12 rounded-full"
                >
                  <User className="h-6 w-6" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10 w-12 h-12 rounded-full"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#102c54] mb-2">Financial Dashboard</h2>
          <p className="text-gray-600 text-lg">Your financial overview for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Interactive Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Monthly Allowance - Navigate to Set Goal */}
          <Card 
            className="bg-gradient-to-br from-[#d8a434] to-[#f4c430] text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:from-[#e6b345] hover:to-[#f8d147]"
            onClick={() => navigate('/set-goal')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Allowance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${monthlyAllowance.toFixed(2)}</div>
              <p className="text-sm opacity-90 mt-1">Tap to set goals</p>
            </CardContent>
          </Card>

          {/* Income Earned - Navigate to Transaction History */}
          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:from-green-600 hover:to-green-700"
            onClick={() => navigate('/transaction-history')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Income Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
              <p className="text-sm opacity-90 mt-1">View history</p>
            </CardContent>
          </Card>

          {/* Spent So Far - Navigate to Transaction History */}
          <Card 
            className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:from-red-600 hover:to-red-700"
            onClick={() => navigate('/transaction-history')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Spent So Far
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-sm opacity-90 mt-1">View history</p>
            </CardContent>
          </Card>

          {/* Credit Score - Navigate to My Score */}
          <Card 
            className="bg-gradient-to-br from-[#102c54] to-[#1e3a72] text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer hover:from-[#1e3a72] hover:to-[#2d4f8a]"
            onClick={() => navigate('/my-score')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SemiCircleGauge score={creditScore?.score || 650} size={140} />
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Spending Categories */}
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-0">
            <CardHeader>
              <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                <TrendingDown className="h-6 w-6" />
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSpendingCategories.length > 0 ? (
                  topSpendingCategories.map(([category, amount], index) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{category}</p>
                            <p className="text-sm text-gray-500">#{index + 1} category</p>
                          </div>
                        </div>
                        <span className="font-bold text-red-600 text-lg">${amount.toFixed(2)}</span>
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
          <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-0">
            <CardHeader>
              <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6" />
                Top Income Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIncomeSources.length > 0 ? (
                  topIncomeSources.map(([category, amount], index) => {
                    const Icon = getCategoryIcon(category);
                    return (
                      <div key={category} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{category}</p>
                            <p className="text-sm text-gray-500">#{index + 1} source</p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600 text-lg">${amount.toFixed(2)}</span>
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
          className="fixed bottom-28 right-5 w-16 h-16 rounded-full bg-[#d8a434] hover:bg-[#d8a434]/90 shadow-2xl z-[60] transition-all duration-200 hover:scale-110"
          onClick={() => navigate('/add-transaction')}
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;

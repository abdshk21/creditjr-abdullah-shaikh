import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PiggyBank, TrendingUp, CreditCard, Award, Target, User, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Confetti from '@/components/Confetti';
import SavingsChart from '@/components/SavingsChart';
import FloatingAddButton from '@/components/FloatingAddButton';
import CreditScoreWidget from '@/components/CreditScoreWidget';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
  created_at: string;
}

interface Goal {
  monthly_saving_goal: number;
  income_expectation: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99', '#1f78b4', '#33a02c'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data as Transaction[];
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
      
      if (error) return null;
      return data as Goal;
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Handle confetti trigger for income transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const latestTransaction = transactions[0];
      const transactionDate = new Date(latestTransaction.created_at);
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      
      if (latestTransaction.type === 'income' && transactionDate > fiveSecondsAgo) {
        setShowConfetti(true);
        setCelebrationMessage(`Nice! You earned some extra د.إ today!`);
        
        setTimeout(() => {
          setCelebrationMessage('');
        }, 5000);
      }
    }
  }, [transactions]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyIncome = goals?.income_expectation || 2000;
  const savingsGoal = goals?.monthly_saving_goal || 500;
  
  // Fix savings calculation - only count actual savings (income - expenses), not just expenses
  const actualSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsProgress = savingsGoal > 0 ? (actualSavings / savingsGoal) * 100 : 0;

  // Updated chart data to show only expenses
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, currentMonth - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    const monthlyExpenses = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === month.getMonth() && transactionDate.getFullYear() === month.getFullYear();
    });

    const expenses = monthlyExpenses
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      name: monthName,
      expenses: expenses
    };
  }).reverse();

  const categoryData = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc: { name: string; value: number }[], t) => {
      const category = t.category;
      const amount = Number(t.amount);
      const existingCategory = acc.find(item => item.name === category);

      if (existingCategory) {
        existingCategory.value += amount;
      } else {
        acc.push({ name: category, value: amount });
      }

      return acc;
    }, []);

  const creditScore = 680;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      {/* Confetti Component */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Celebration Message */}
      {celebrationMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-fade-in">
          {celebrationMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
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
                <p className="text-white/80 text-lg">By Tyche Online Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all"
                  onClick={() => navigate('/my-account')}
                  onError={(e) => {
                    // Fallback to default user icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-account')}
                className={`text-white hover:bg-white/10 w-12 h-12 rounded-full ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`}
              >
                <User className="h-6 w-6" />
              </Button>
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

        <h2 className="text-3xl font-bold text-[#102c54]">Your Financial Dashboard</h2>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="shadow-lg border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
            onClick={() => navigate('/set-goal')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Allowance</CardTitle>
              <PiggyBank className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{monthlyIncome.toFixed(2)}</div>
              <p className="text-xs text-white/80">Target for this month</p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white"
            onClick={() => navigate('/transaction-history')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income Earned</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{totalIncome.toFixed(2)}</div>
              <p className="text-xs text-white/80">This month</p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-lg border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 text-white"
            onClick={() => navigate('/transaction-history')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spent So Far</CardTitle>
              <CreditCard className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">د.إ{totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-white/80">This month</p>
            </CardContent>
          </Card>

          <CreditScoreWidget size="small" showTitle={false} />
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Spending Trend - Fixed to show only expenses */}
          <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
            <CardHeader>
              <CardTitle className="text-[#102c54]">Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`د.إ${Number(value).toFixed(2)}`, 'Expenses']} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
            <CardHeader>
              <CardTitle className="text-[#102c54]">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: د.إ${Number(value).toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`د.إ${Number(value).toFixed(2)}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Savings Goal Progress with new chart */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Target className="h-6 w-6" />
              Savings Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Current Savings</span>
                <span>د.إ{actualSavings.toFixed(2)} / د.إ{savingsGoal.toFixed(2)}</span>
              </div>
              <Progress value={savingsProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {actualSavings >= savingsGoal 
                  ? "🎉 Congratulations! You've reached your savings goal!"
                  : actualSavings >= 0
                  ? `You need د.إ${(savingsGoal - actualSavings).toFixed(2)} more to reach your goal.`
                  : `You're د.إ${Math.abs(actualSavings).toFixed(2)} in the red this month.`
                }
              </p>
              <SavingsChart actualSavings={actualSavings} savingsGoal={savingsGoal} />
            </div>
          </CardContent>
        </Card>

        {/* Floating Add Button */}
        <FloatingAddButton />
      </div>
    </div>
  );
};

export default Dashboard;

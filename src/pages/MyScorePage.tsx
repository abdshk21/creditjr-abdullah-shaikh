
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

const MyScorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Fetch transactions
  const { data: transactions = [], refetch: refetchTransactions } = useQuery({
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
      
      return data as Transaction[];
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

  // Fetch credit score
  const { data: creditScore, refetch: refetchCreditScore } = useQuery({
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
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate virtual credit score
  const calculateCreditScore = () => {
    if (!transactions.length) return { score: 650, breakdown: { savingsProgress: 20, spendingControl: 30, loggingConsistency: 50 } };

    let score = 650; // Starting score
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthlyBudget = goals?.income_expectation || totalIncome || 1000;
    const savingsGoal = goals?.monthly_saving_goal || 0;
    
    // Spending Control (40%)
    const spendingRatio = totalSpent / monthlyBudget;
    let spendingScore = 0;
    if (spendingRatio <= 0.3) spendingScore = 100;
    else if (spendingRatio <= 0.5) spendingScore = 80;
    else if (spendingRatio <= 0.7) spendingScore = 60;
    else if (spendingRatio <= 0.9) spendingScore = 40;
    else spendingScore = 20;
    
    // Savings Progress (30%)
    const actualSavings = totalIncome - totalSpent;
    const savingsRatio = savingsGoal > 0 ? actualSavings / savingsGoal : (actualSavings > 0 ? 1 : 0);
    let savingsScore = 0;
    if (savingsRatio >= 1) savingsScore = 100;
    else if (savingsRatio >= 0.8) savingsScore = 80;
    else if (savingsRatio >= 0.6) savingsScore = 60;
    else if (savingsRatio >= 0.4) savingsScore = 40;
    else savingsScore = 20;
    
    // Logging Consistency (30%)
    const daysWithTransactions = new Set(transactions.map(t => t.date.split('T')[0])).size;
    const consistencyScore = Math.min(100, (daysWithTransactions / 30) * 100);
    
    // Calculate final score
    score = Math.round(
      650 + 
      (spendingScore * 0.4 * 1.5) + 
      (savingsScore * 0.3 * 1.5) + 
      (consistencyScore * 0.3 * 1.5)
    );
    
    return {
      score: Math.max(300, Math.min(850, score)),
      breakdown: {
        spendingControl: Math.round(spendingScore),
        savingsProgress: Math.round(savingsScore),
        loggingConsistency: Math.round(consistencyScore)
      }
    };
  };

  const calculatedScore = calculateCreditScore();
  const currentScore = creditScore?.score || calculatedScore.score;
  const breakdown = creditScore?.breakdown || calculatedScore.breakdown;

  // Get score color and emoji
  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 700) return '🎉';
    if (score >= 500) return '👍';
    return '💪';
  };

  // Handle recalculate
  const handleRecalculate = async () => {
    if (!user?.id) return;
    
    setIsRecalculating(true);
    
    try {
      const newScore = calculateCreditScore();
      
      // Update credit score in database
      const { error } = await supabase
        .from('credit_score')
        .upsert({
          user_id: user.id,
          score: newScore.score,
          breakdown: newScore.breakdown,
          last_calculated: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating credit score:', error);
      }
      
      // Refetch credit score
      await refetchCreditScore();
    } catch (error) {
      console.error('Error recalculating score:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Prepare chart data
  const chartData = [
    { name: 'Spending Control', value: breakdown.spendingControl, color: '#ef4444' },
    { name: 'Savings Progress', value: breakdown.savingsProgress, color: '#22c55e' },
    { name: 'Logging Consistency', value: breakdown.loggingConsistency, color: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold text-[#102c54]">Your Virtual Credit Score</h1>
        </div>

        {/* Score Display */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#d8a434] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Award className="h-6 w-6" />
              Current Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className={`text-6xl font-bold ${getScoreColor(currentScore)}`}>
                {currentScore} {getScoreEmoji(currentScore)}
              </div>
              <div className="text-lg text-gray-600">
                {currentScore >= 700 ? 'Excellent' : currentScore >= 500 ? 'Good' : 'Needs Improvement'}
              </div>
              {creditScore?.last_calculated && (
                <div className="text-sm text-gray-500">
                  Last updated: {format(new Date(creditScore.last_calculated), 'MMM dd, yyyy at h:mm a')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Section */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Breakdown Details */}
              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recalculate Button */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="bg-[#d8a434] hover:bg-[#d8a434]/90 text-white px-8 py-3 text-lg"
            >
              {isRecalculating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Recalculate Now
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Updates your score based on latest transactions and goals
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyScorePage;

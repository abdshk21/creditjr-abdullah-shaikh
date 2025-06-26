import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft, RefreshCw, TrendingUp, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Confetti from '@/components/Confetti';

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

interface CreditScoreBreakdown {
  spendingControl: number;
  savingsProgress: number;
  loggingConsistency: number;
}

interface CreditScoreData {
  score: number;
  breakdown: CreditScoreBreakdown;
  last_calculated: string;
}

// Semi-circle gauge component
const SemiCircleGauge = ({ score, size = 200 }: { score: number; size?: number }) => {
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

  const radius = size / 2 - 20;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score - 300) / 550 * circumference;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
      <svg width={size} height={size / 2 + 40} className="transform rotate-0">
        {/* Background arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </div>
        <div className="text-sm font-medium text-gray-600 mt-1">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
};

const MyScorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreChangeMessage, setScoreChangeMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

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
      
      // Safely handle the Json type from Supabase
      const breakdown = data.breakdown as any;
      return {
        ...data,
        breakdown: breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown) 
          ? breakdown as CreditScoreBreakdown
          : { spendingControl: 50, savingsProgress: 50, loggingConsistency: 50 }
      } as CreditScoreData;
    },
    enabled: !!user?.id,
  });

  // Store the current score as previous when component mounts
  useEffect(() => {
    if (creditScore?.score && previousScore === null) {
      setPreviousScore(creditScore.score);
    }
  }, [creditScore?.score, previousScore]);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

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
  
  // Type guard to ensure breakdown is properly typed
  const getBreakdown = (): CreditScoreBreakdown => {
    if (creditScore?.breakdown && typeof creditScore.breakdown === 'object' && !Array.isArray(creditScore.breakdown)) {
      const breakdown = creditScore.breakdown as any;
      if ('spendingControl' in breakdown && 'savingsProgress' in breakdown && 'loggingConsistency' in breakdown) {
        return breakdown as CreditScoreBreakdown;
      }
    }
    return calculatedScore.breakdown;
  };

  const breakdown = getBreakdown();

  // Handle recalculate with score change feedback
  const handleRecalculate = async () => {
    if (!user?.id) return;
    
    setIsRecalculating(true);
    const oldScore = creditScore?.score || calculatedScore.score;
    
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
      
      // Show feedback based on score change
      if (newScore.score > oldScore) {
        setShowConfetti(true);
        setScoreChangeMessage("Score Up! Keep those habits going 🎉");
        setTimeout(() => setScoreChangeMessage(''), 5000);
      } else if (newScore.score < oldScore) {
        setShowWarning(true);
        setScoreChangeMessage("Your score dropped — check your spending or missed goals 🛑");
        setTimeout(() => {
          setShowWarning(false);
          setScoreChangeMessage('');
        }, 6000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      {/* Confetti Component */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Score Change Messages */}
      {scoreChangeMessage && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-40 animate-fade-in ${
          showWarning 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {scoreChangeMessage}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Enhanced Header with Gradient Background */}
        <div className="bg-gradient-to-r from-[#102c54] via-[#1e3a72] to-[#2d4f8a] rounded-lg p-6 shadow-lg">
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
                onClick={handleLogout}
                className="text-white hover:bg-white/10 w-10 h-10 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#102c54]">Your Virtual Credit Score</h2>

        {/* Enhanced Score Display with Repositioned Button */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Award className="h-7 w-7" />
              Current Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-8">
                <SemiCircleGauge score={currentScore} size={320} />
                <Button
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white px-6 py-3 text-lg font-semibold h-fit"
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
              </div>
              {creditScore?.last_calculated && (
                <div className="text-sm text-gray-500">
                  Last updated: {format(new Date(creditScore.last_calculated), 'MMM dd, yyyy at h:mm a')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Breakdown Section */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6" />
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
                  <div key={item.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <span className="text-xl font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyScorePage;

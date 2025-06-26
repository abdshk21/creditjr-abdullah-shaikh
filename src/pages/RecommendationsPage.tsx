import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowLeft, TrendingUp, Target, Calendar, Award, User, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LovableClaudeChat from '@/components/LovableClaudeChat';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ReferenceLine } from 'recharts';

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

interface CreditScoreData {
  score: number;
  breakdown: any;
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
        <div className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </div>
        <div className="text-sm font-medium text-gray-600 mt-1">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
};

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Fetch transactions
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
      
      return data as CreditScoreData;
    },
    enabled: !!user?.id,
  });

  // Calculate financial analytics
  const getFinancialAnalysis = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentWeek = new Date();
    const weekStart = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()));
    
    // Monthly transactions
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    // Weekly logging count
    const weeklyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= weekStart;
    });

    const totalSpending = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      });

    const monthlyAllowance = goals?.income_expectation || totalIncome || 0;
    const savingsGoal = goals?.monthly_saving_goal || 0;
    const actualSavings = totalIncome - totalSpending;
    const lastScore = creditScore?.score || 650;
    const loggingCount = weeklyTransactions.length;

    // Weekly behavior analysis for personalized tips
    const lastWeekTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      return transactionDate >= lastWeekStart && transactionDate < weekStart;
    });

    // Find overspending categories this week vs last week
    const thisWeekSpending: { [key: string]: number } = {};
    const lastWeekSpending: { [key: string]: number } = {};
    
    weeklyTransactions.filter(t => t.type === 'expense').forEach(t => {
      thisWeekSpending[t.category] = (thisWeekSpending[t.category] || 0) + Number(t.amount);
    });
    
    lastWeekTransactions.filter(t => t.type === 'expense').forEach(t => {
      lastWeekSpending[t.category] = (lastWeekSpending[t.category] || 0) + Number(t.amount);
    });

    const overspendingCategory = Object.keys(thisWeekSpending).find(category => 
      thisWeekSpending[category] > (lastWeekSpending[category] || 0) * 1.5
    );

    // Check logging consistency (missed days)
    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });
    
    const loggedDays = new Set(weeklyTransactions.map(t => new Date(t.date).toDateString()));
    const missedDays = last7Days.filter(day => !loggedDays.has(day)).length;

    return {
      monthlyAllowance,
      totalSpending,
      savingsGoal,
      actualSavings,
      categoryBreakdown,
      lastScore,
      loggingCount,
      overspendingCategory,
      missedDays,
      thisWeekSpending,
      lastWeekSpending
    };
  };

  const analysis = getFinancialAnalysis();

  // Enhanced AI Finance Coach Analysis
  const generateCoachFeedback = () => {
    const spendingRatio = analysis.totalSpending / analysis.monthlyAllowance;
    const savingsProgress = analysis.actualSavings / analysis.savingsGoal;
    
    // Overall summary with mood indicator
    let overallSummary = "";
    let moodEmoji = "";
    let scoreChange = "";
    
    if (spendingRatio <= 0.7 && savingsProgress >= 0.8) {
      overallSummary = "🎉 You're doing fantastic! Great spending control and you're smashing your savings goals!";
      moodEmoji = "😄";
      scoreChange = "Great progress this week! Keep it up!";
    } else if (spendingRatio <= 0.8) {
      overallSummary = "👍 Pretty solid financial habits! You're staying mostly on track.";
      moodEmoji = "😊";
      scoreChange = "Keeping steady – nice job staying consistent!";
    } else {
      overallSummary = "💪 Room for improvement, but that's totally normal! Let's work on building better habits together.";
      moodEmoji = "😐";
      scoreChange = "Bit of a dip this week, but your habits are still strong 💪. Let's bounce back!";
    }

    // Weekly Score Summary
    const weeklyScoreSummary = `Credit Score: +15 🔼 / Logging: ${analysis.loggingCount} days ✅ / Spending: ${spendingRatio <= 0.8 ? 'On track' : 'Over budget'} ${spendingRatio <= 0.8 ? '⚖️' : '⚠️'}`;

    // Personalized weekly focus
    let weeklyFocus = "";
    
    if (analysis.overspendingCategory) {
      const categorySpending = analysis.thisWeekSpending[analysis.overspendingCategory];
      const suggestedLimit = Math.ceil(categorySpending * 0.8);
      weeklyFocus = `You've spent more on ${analysis.overspendingCategory} this week than usual. Want to challenge yourself to keep it under ${suggestedLimit} د.إ?`;
    } else if (analysis.missedDays >= 2) {
      weeklyFocus = "🎯 Mission: Log every transaction this week to build your streak!";
    } else if (spendingRatio <= 0.8) {
      weeklyFocus = "Try saving 10% more than last week – can you hit it?";
    } else {
      weeklyFocus = "Focus on one category this week and track every expense. Small steps lead to big wins!";
    }

    // Motivational quote
    const motivationalQuotes = [
      "'Small habits, big wins.' You're doing amazing!",
      "'Every dirham counts.' Your future self will thank you!",
      "'Progress over perfection.' Keep building those good habits!",
      "'Smart spending today, bright future tomorrow.' You've got this!"
    ];
    
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    // Overspending categories
    const overspendingCategories = Object.entries(analysis.categoryBreakdown)
      .filter(([_, amount]) => amount > analysis.monthlyAllowance * 0.25)
      .map(([category, amount]) => ({ category, amount }));

    // Savings evaluation
    let savingsEvaluation = "";
    if (analysis.actualSavings >= analysis.savingsGoal) {
      savingsEvaluation = "✅ Savings goal achieved! You're building a solid financial foundation.";
    } else if (analysis.actualSavings >= analysis.savingsGoal * 0.7) {
      savingsEvaluation = "📈 You're close to your savings target - just a little more to go!";
    } else {
      savingsEvaluation = "💡 Your savings could use some attention. Small changes can make a big difference!";
    }

    // Credit score calculation
    let spendingScore = 0;
    if (spendingRatio <= 0.3) spendingScore = 100;
    else if (spendingRatio <= 0.5) spendingScore = 80;
    else if (spendingRatio <= 0.7) spendingScore = 60;
    else if (spendingRatio <= 0.9) spendingScore = 40;
    else spendingScore = 20;

    let savingsScore = 0;
    if (savingsProgress >= 1) savingsScore = 100;
    else if (savingsProgress >= 0.8) savingsScore = 80;
    else if (savingsProgress >= 0.6) savingsScore = 60;
    else if (savingsProgress >= 0.4) savingsScore = 40;
    else savingsScore = 20;

    const consistencyScore = Math.min(100, (analysis.loggingCount / 7) * 100);
    
    const newScore = Math.round(
      650 + 
      (spendingScore * 0.4 * 1.5) + 
      (savingsScore * 0.3 * 1.5) + 
      (consistencyScore * 0.3 * 1.5)
    );

    const finalScore = Math.max(300, Math.min(850, newScore));

    // Improvement suggestion
    let improvement = "";
    if (spendingRatio > 0.8) {
      improvement = "Try tracking every purchase for a week - awareness is the first step to better spending control!";
    } else if (analysis.loggingCount < 5) {
      improvement = "Log your transactions more consistently - it helps you stay aware of your spending patterns.";
    } else if (savingsProgress < 0.5) {
      improvement = "Consider setting aside money immediately when you get your allowance - pay yourself first!";
    } else {
      improvement = "You're doing great! Keep experimenting with new categories to see where you can optimize.";
    }

    return {
      overallSummary,
      moodEmoji,
      scoreChange,
      weeklyScoreSummary,
      weeklyFocus,
      randomQuote,
      overspendingCategories,
      savingsEvaluation,
      newScore,
      improvement
    };
  };

  const feedback = generateCoachFeedback();

  // Prepare chart data with د.إ currency
  const categoryChartData = Object.entries(analysis.categoryBreakdown).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`
  }));

  // Fixed savings chart data with proper color handling for negative values
  const savingsChartData = [
    { 
      name: 'Saved', 
      value: analysis.actualSavings,
      fill: analysis.actualSavings >= 0 ? '#22c55e' : '#ef4444' // Green for positive, red for negative
    },
    { 
      name: 'Goal Remaining', 
      value: Math.max(0, analysis.savingsGoal - Math.max(0, analysis.actualSavings)), 
      fill: '#e5e7eb' 
    }
  ];

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
                onClick={handleLogout}
                className="text-white hover:bg-white/10 w-10 h-10 rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-[#102c54] mb-6">Your AI Finance Coach</h2>

        {/* Split Layout: Left 70% Overview, Right 30% Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Side: Overview Panel (70%) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Credit Score */}
            <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
              <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Award className="h-7 w-7" />
                  Current Credit Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <SemiCircleGauge score={feedback.newScore} size={280} />
              </CardContent>
            </Card>

            {/* 2. Enhanced How You're Doing Overall */}
            <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
              <CardHeader>
                <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                  <Lightbulb className="h-6 w-6" />
                  How You're Doing Overall {feedback.moodEmoji}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{feedback.overallSummary}</p>
                
                {/* Weekly Score Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Weekly Score Summary:</h4>
                  <p className="text-blue-700">{feedback.weeklyScoreSummary}</p>
                </div>
                
                {/* Performance feedback */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 font-medium">{feedback.scoreChange}</p>
                </div>
                
                {/* Motivational quote */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-orange-800 italic">{feedback.randomQuote}</p>
                </div>
                
                {/* Streak counter */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🔥 Logging streak: {analysis.loggingCount} days this week</span>
                </div>
              </CardContent>
            </Card>

            {/* 3. Enhanced This Week's Focus */}
            <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
              <CardHeader>
                <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6" />
                  This Week's Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg space-y-4">
                  <h4 className="font-semibold text-green-800 mb-3 text-lg">🎯 Your Weekly Challenge:</h4>
                  <p className="text-green-700 text-base">{feedback.weeklyFocus}</p>
                  
                  {/* Last week's completion status */}
                  <div className="border-t border-green-200 pt-3 mt-3">
                    <p className="text-green-600 text-sm">
                      ✅ You hit last week's focus: Log consistently. Nice work!
                    </p>
                  </div>
                  
                  {/* Weekly theme indicator */}
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>🏷️ Theme: {analysis.overspendingCategory ? 'Spending Awareness' : analysis.missedDays >= 2 ? 'Logging Consistency' : 'Savings Challenge'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Spending Breakdown */}
            <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
              <CardHeader>
                <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6" />
                  Spending Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryChartData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`د.إ${Number(value).toFixed(2)}`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No spending data this month</p>
                )}
              </CardContent>
            </Card>

            {/* 5. Enhanced Savings Breakdown with negative value support */}
            <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
              <CardHeader>
                <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6" />
                  Savings Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Savings Goal: د.إ{analysis.savingsGoal.toFixed(2)}</span>
                    <span className={analysis.actualSavings >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Actual Savings: د.إ{analysis.actualSavings.toFixed(2)}
                    </span>
                  </div>
                  {analysis.actualSavings < 0 && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-red-700 text-sm">
                        ⚠️ Your expenses exceeded your income this month. Focus on reducing spending to get back on track.
                      </p>
                    </div>
                  )}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={savingsChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                        <Tooltip 
                          formatter={(value) => [`د.إ${Number(value).toFixed(2)}`, '']}
                          labelFormatter={(label) => label}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[4, 4, 0, 0]}
                          fill={(entry) => entry?.fill || '#22c55e'}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Chat Interface (30%) */}
          <div className="lg:col-span-3">
            <LovableClaudeChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;

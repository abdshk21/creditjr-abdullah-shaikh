
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowLeft, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

    return {
      monthlyAllowance,
      totalSpending,
      savingsGoal,
      actualSavings,
      categoryBreakdown,
      lastScore,
      loggingCount
    };
  };

  const analysis = getFinancialAnalysis();

  // AI Finance Coach Analysis
  const generateCoachFeedback = () => {
    const spendingRatio = analysis.totalSpending / analysis.monthlyAllowance;
    const savingsProgress = analysis.actualSavings / analysis.savingsGoal;
    
    // Overall summary
    let overallSummary = "";
    if (spendingRatio <= 0.7 && savingsProgress >= 0.8) {
      overallSummary = "🎉 You're doing fantastic! Great spending control and you're smashing your savings goals!";
    } else if (spendingRatio <= 0.8) {
      overallSummary = "👍 Pretty solid financial habits! You're staying mostly on track.";
    } else {
      overallSummary = "💪 Room for improvement, but that's totally normal! Let's work on building better habits together.";
    }

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
      overspendingCategories,
      savingsEvaluation,
      newScore,
      improvement
    };
  };

  const feedback = generateCoachFeedback();

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
          <h1 className="text-3xl font-bold text-[#102c54]">Your AI Finance Coach</h1>
        </div>

        {/* Overall Summary */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#d8a434] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Lightbulb className="h-6 w-6" />
              How You're Doing Overall
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-lg">{feedback.overallSummary}</p>
          </CardContent>
        </Card>

        {/* Spending Analysis */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Allowance:</span>
                <p className="font-semibold">${analysis.monthlyAllowance.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Spending:</span>
                <p className="font-semibold text-red-600">${analysis.totalSpending.toFixed(2)}</p>
              </div>
            </div>
            
            {feedback.overspendingCategories.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ Categories to Watch:</h4>
                {feedback.overspendingCategories.map(({ category, amount }) => (
                  <p key={category} className="text-sm text-orange-700">
                    {category}: ${amount.toFixed(2)}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Progress */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Target className="h-5 w-5" />
              Savings Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Savings Goal:</span>
                <p className="font-semibold">${analysis.savingsGoal.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Actual Savings:</span>
                <p className={`font-semibold ${analysis.actualSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analysis.actualSavings.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">{feedback.savingsEvaluation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Updated Credit Score */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Award className="h-5 w-5" />
              Updated Virtual Credit Score
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-5xl font-bold ${
              feedback.newScore >= 700 ? 'text-green-600' : 
              feedback.newScore >= 500 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {feedback.newScore}
            </div>
            <div className="text-sm text-gray-600">
              Previous: {analysis.lastScore} | Change: {feedback.newScore > analysis.lastScore ? '+' : ''}{feedback.newScore - analysis.lastScore}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Improvement */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Week's Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">💡 Your Action Item:</h4>
              <p className="text-green-700">{feedback.improvement}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[#102c54]">
                You've got this! Every small step counts toward building lifelong financial confidence. 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationsPage;

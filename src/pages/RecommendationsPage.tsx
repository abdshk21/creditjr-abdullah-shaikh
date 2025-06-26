
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, LogOut, Lightbulb, TrendingUp, PiggyBank, Target, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

const RecommendationsPage = () => {
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
  
  const actualSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsProgress = savingsGoal > 0 ? (actualSavings / savingsGoal) * 100 : 0;

  const generateRecommendations = () => {
    const recommendations = [];

    if (totalExpenses > monthlyIncome * 0.7) {
      recommendations.push(
        "Consider reducing your spending to stay within 70% of your income."
      );
    }

    if (actualSavings < savingsGoal * 0.5) {
      recommendations.push(
        "Try to increase your savings to reach at least half of your savings goal."
      );
    }

    if (transactions.length < 10) {
      recommendations.push(
        "Log more transactions to get a better overview of your finances."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep up the good work! Your finances are looking great.");
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
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
                className={`text-white hover:bg-white/10 w-10 h-10 rounded-full ${user?.user_metadata?.avatar_url ? 'hidden' : ''}`}
              >
                <User className="h-5 w-5" />
              </Button>
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

        <h2 className="text-3xl font-bold text-[#102c54]">Financial Tips & Recommendations</h2>

        {/* Credit Score Widget */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <CreditScoreWidget size="large" showTitle={true} />
          </div>
        </div>

        {/* Personalized Recommendations */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Lightbulb className="h-7 w-7" />
              Personalized Tips for You
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ul className="list-disc list-inside space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-lg text-gray-700">
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* General Financial Tips */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl text-[#102c54] flex items-center gap-3">
              <Target className="h-7 w-7" />
              General Financial Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ul className="list-disc list-inside space-y-3">
              <li className="text-lg text-gray-700">
                Create a budget and stick to it.
              </li>
              <li className="text-lg text-gray-700">
                Track your spending to identify areas where you can cut back.
              </li>
              <li className="text-lg text-gray-700">
                Set financial goals and create a plan to achieve them.
              </li>
              <li className="text-lg text-gray-700">
                Automate your savings to make it easier to save.
              </li>
              <li className="text-lg text-gray-700">
                Avoid unnecessary debt and pay off high-interest debt as soon as possible.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Floating Add Button */}
        <FloatingAddButton />
      </div>
    </div>
  );
};

export default RecommendationsPage;

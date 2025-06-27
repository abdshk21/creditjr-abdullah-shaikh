import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, User, LogOut, Lightbulb, TrendingUp, PiggyBank, Target, AlertTriangle, DollarSign, Calculator, CreditCard, Bell, Wallet, FileText } from 'lucide-react';
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
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [envelopeModalOpen, setEnvelopeModalOpen] = useState(false);

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

  const personalizedCards = [
    {
      title: "Track Your Daily Expenses",
      category: "Spending",
      urgency: "HIGH",
      description: "Log every purchase, no matter how small. This helps you see where your money goes and identify areas to cut back.",
      buttonText: "Start Tracking",
      buttonAction: () => navigate('/transaction-history'),
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      title: "Set Up an Emergency Fund",
      category: "Saving",
      urgency: "HIGH",
      description: "Aim to save at least 3-6 months of expenses. Start small with just $5-10 per week.",
      buttonText: "Set Goal",
      buttonAction: () => navigate('/set-goal'),
      icon: <PiggyBank className="h-6 w-6" />
    },
    {
      title: "Follow the 50/30/20 Rule",
      category: "Budgeting",
      urgency: "MEDIUM",
      description: "50% for needs, 30% for wants, 20% for savings. Adjust percentages based on your situation.",
      buttonText: "Learn More",
      buttonAction: () => setRuleModalOpen(true),
      icon: <Calculator className="h-6 w-6" />
    },
    {
      title: "Review Subscriptions Monthly",
      category: "Spending",
      urgency: "MEDIUM",
      description: "Cancel unused subscriptions and services. Small recurring charges add up quickly.",
      buttonText: "Review Now",
      buttonAction: () => navigate('/transaction-history'),
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      title: "Automate Your Savings",
      category: "Saving",
      urgency: "LOW",
      description: "Set up automatic transfers to your savings account right after you get paid.",
      buttonText: "Set Up",
      buttonAction: () => navigate('/set-goal'),
      icon: <Bell className="h-6 w-6" />
    },
    {
      title: "Use the Envelope Method",
      category: "Budgeting",
      urgency: "LOW",
      description: "Allocate specific amounts for different categories and stick to those limits.",
      buttonText: "Try It",
      buttonAction: () => setEnvelopeModalOpen(true),
      icon: <Wallet className="h-6 w-6" />
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

        {/* New Personalized Recommendations Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#0d1d3d]">Personalized Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedCards.map((card, index) => (
              <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#0d1d3d]/10 text-[#0d1d3d]">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#0d1d3d]">{card.title}</h3>
                        <p className="text-sm text-gray-600">{card.category}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs font-semibold px-2 py-1 rounded-full border ${getUrgencyColor(card.urgency)}`}>
                      {card.urgency}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  
                  <Button 
                    onClick={card.buttonAction}
                    className="w-full bg-[#0d1d3d] hover:bg-[#0d1d3d]/90 text-white font-medium"
                  >
                    {card.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Financial Tips Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-[#0d1d3d]" />
            <h2 className="text-3xl font-bold text-[#0d1d3d]">Quick Financial Tips</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Daily Habits Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#0d1d3d]">Daily Habits</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Check your account balance daily</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Track every expense immediately</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Review your budget weekly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Set spending alerts on your accounts</span>
                </li>
              </ul>
            </div>

            {/* Smart Saving Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#0d1d3d]">Smart Saving</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Save loose change and small bills</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Use cashback apps and rewards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Compare prices before major purchases</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0d1d3d] mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">Avoid impulse buying with 24-hour rule</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Add Button */}
        <FloatingAddButton />
      </div>

      {/* 50/30/20 Rule Modal */}
      <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d1d3d]">
              The 50/30/20 Rule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="font-semibold">50% - Needs</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">Essential expenses like rent, groceries, utilities, and minimum debt payments.</p>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="font-semibold">30% - Wants</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">Entertainment, dining out, hobbies, and other non-essential purchases.</p>
              
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="font-semibold">20% - Savings</span>
              </div>
              <p className="text-sm text-gray-600 ml-7">Emergency fund, retirement savings, and debt payments above minimums.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Envelope Method Modal */}
      <Dialog open={envelopeModalOpen} onOpenChange={setEnvelopeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0d1d3d]">
              The Envelope Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              The envelope method helps you control spending by allocating cash for specific categories.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-[#0d1d3d]">How it works:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Create "envelopes" for each spending category</li>
                <li>• Put a set amount of cash in each envelope</li>
                <li>• Once an envelope is empty, you're done spending in that category</li>
                <li>• Use digital apps to track virtual envelopes</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecommendationsPage;

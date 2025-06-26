
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, TrendingUp, Target, DollarSign, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import FloatingAddButton from '@/components/FloatingAddButton';
import CreditScoreWidget from '@/components/CreditScoreWidget';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const recommendations = [
    {
      id: 1,
      category: 'Spending',
      title: 'Track Your Daily Expenses',
      description: 'Log every purchase, no matter how small. This helps you see where your money goes and identify areas to cut back.',
      icon: DollarSign,
      priority: 'high',
      actionText: 'Start Tracking'
    },
    {
      id: 2,
      category: 'Saving',
      title: 'Set Up an Emergency Fund',
      description: 'Aim to save at least 3-6 months of expenses. Start small with just $5-10 per week.',
      icon: Target,
      priority: 'high',
      actionText: 'Set Goal'
    },
    {
      id: 3,
      category: 'Budgeting',
      title: 'Follow the 50/30/20 Rule',
      description: '50% for needs, 30% for wants, 20% for savings. Adjust percentages based on your situation.',
      icon: TrendingUp,
      priority: 'medium',
      actionText: 'Learn More'
    },
    {
      id: 4,
      category: 'Spending',
      title: 'Review Subscriptions Monthly',
      description: 'Cancel unused subscriptions and services. Small recurring charges add up quickly.',
      icon: DollarSign,
      priority: 'medium',
      actionText: 'Review Now'
    },
    {
      id: 5,
      category: 'Saving',
      title: 'Automate Your Savings',
      description: 'Set up automatic transfers to your savings account right after you get paid.',
      icon: Target,
      priority: 'low',
      actionText: 'Set Up'
    },
    {
      id: 6,
      category: 'Budgeting',
      title: 'Use the Envelope Method',
      description: 'Allocate specific amounts for different categories and stick to those limits.',
      icon: TrendingUp,
      priority: 'low',
      actionText: 'Try It'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Spending': return DollarSign;
      case 'Saving': return Target;
      case 'Budgeting': return TrendingUp;
      default: return Lightbulb;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Enhanced Header */}
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
                  <h1 className="text-3xl font-bold text-white">Financial Tips</h1>
                  <p className="text-white/80">Improve your financial habits</p>
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

        {/* Credit Score Widget */}
        <div className="flex justify-center">
          <div onClick={() => navigate('/my-score')} className="cursor-pointer">
            <CreditScoreWidget size="small" showTitle={true} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#102c54]">Personalized Recommendations</h2>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const IconComponent = getCategoryIcon(rec.category);
            return (
              <Card 
                key={rec.id} 
                className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#102c54] rounded-lg">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#102c54]">{rec.title}</CardTitle>
                        <span className="text-sm text-gray-500">{rec.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{rec.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#102c54] to-[#1e3a72] hover:from-[#1e3a72] hover:to-[#2d4f8a] text-white"
                    onClick={() => {
                      if (rec.category === 'Saving') navigate('/set-goal');
                      if (rec.category === 'Spending') navigate('/add-transaction');
                    }}
                  >
                    {rec.actionText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* General Tips Section */}
        <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              Quick Financial Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#102c54]">Daily Habits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your account balance daily</li>
                  <li>• Track every expense immediately</li>
                  <li>• Review your budget weekly</li>
                  <li>• Set spending alerts on your accounts</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#102c54]">Smart Saving</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Save loose change and small bills</li>
                  <li>• Use cashback apps and rewards</li>
                  <li>• Compare prices before major purchases</li>
                  <li>• Avoid impulse buying with 24-hour rule</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
};

export default RecommendationsPage;

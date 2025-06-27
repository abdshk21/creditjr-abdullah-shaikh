import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft, RefreshCw, TrendingUp, User, LogOut, PiggyBank, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Confetti from '@/components/Confetti';
import FloatingAddButton from '@/components/FloatingAddButton';
import { useCreditScore } from '@/hooks/useCreditScore';
import ScoreExplanationModal from '@/components/ScoreExplanationModal';

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

// Semi-circle gauge component with color coding
const SemiCircleGauge = ({ score, size = 200 }: { score: number; size?: number }) => {
  const getScoreColor = (score: number) => {
    if (score < 580) return '#ef4444'; // red (Poor)
    if (score >= 580 && score < 700) return '#eab308'; // gold (Fair)
    return '#22c55e'; // green (Good/Excellent)
  };

  const getScoreLabel = (score: number) => {
    if (score >= 700) return 'EXCELLENT';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'spendingControl' | 'savingsProgress' | 'loggingConsistency'>('spendingControl');

  const { 
    currentScore, 
    breakdown, 
    getScoreColor, 
    getScoreLabel, 
    recalculateScore, 
    creditScore 
  } = useCreditScore();

  // Store the current score as previous when component mounts
  useEffect(() => {
    if (currentScore && previousScore === null) {
      setPreviousScore(currentScore);
    }
  }, [currentScore, previousScore]);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Handle recalculate with score change feedback
  const handleRecalculate = async () => {
    if (!user?.id) return;
    
    setIsRecalculating(true);
    const oldScore = currentScore;
    
    try {
      const newScore = await recalculateScore();
      
      if (newScore) {
        // Show feedback based on score change
        if (newScore > oldScore) {
          setShowConfetti(true);
          setScoreChangeMessage("Score Up! Keep those habits going 🎉");
          setTimeout(() => setScoreChangeMessage(''), 5000);
        } else if (newScore < oldScore) {
          setShowWarning(true);
          setScoreChangeMessage("Your score dropped — check your spending or missed goals 🛑");
          setTimeout(() => {
            setShowWarning(false);
            setScoreChangeMessage('');
          }, 6000);
        }
      }
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

  // Fixed timestamp formatting function
  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      return format(date, 'MMM dd, yyyy – h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Never';
    }
  };

  const handleLearnMore = (metric: 'spendingControl' | 'savingsProgress' | 'loggingConsistency') => {
    setSelectedMetric(metric);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
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

      <div className="max-w-6xl mx-auto space-y-6">
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

        <h2 className="text-3xl font-bold text-[#102c54]">Your Virtual Credit Score</h2>

        {/* Top Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Current Score */}
          <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
            <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Award className="h-7 w-7" />
                Current Score
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="relative" style={{ width: 280, height: 180 }}>
                <svg width={280} height={180} className="transform rotate-0">
                  <path
                    d={`M 20 140 A 120 120 0 0 1 260 140`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 20 140 A 120 120 0 0 1 260 140`}
                    fill="none"
                    stroke={getScoreColor(currentScore)}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={Math.PI * 120}
                    strokeDashoffset={Math.PI * 120 - (currentScore - 300) / 550 * Math.PI * 120}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold" style={{ color: getScoreColor(currentScore) }}>
                    {currentScore}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-1">
                    {getScoreLabel(currentScore)}
                  </div>
                </div>
              </div>
              {creditScore?.last_calculated && (
                <div className="text-sm text-gray-500 mt-4">
                  Last updated: {formatLastUpdated(creditScore.last_calculated)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Score Breakdown Pie Chart */}
          <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
            <CardHeader>
              <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>

        {/* Recalculate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white px-8 py-4 text-lg font-semibold"
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

        {/* Score Breakdown Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-700">Spending Control (40%)</div>
                <div className="text-sm text-gray-600 mt-1">
                  How well you stay within your monthly budget
                </div>
                <div className="text-lg font-bold text-red-600 mt-2">
                  {breakdown.spendingControl}%
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleLearnMore('spendingControl')}
              className="ml-4"
            >
              Learn More
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <PiggyBank className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-green-700">Savings Progress (30%)</div>
                <div className="text-sm text-gray-600 mt-1">
                  Progress towards your monthly savings goal
                </div>
                <div className="text-lg font-bold text-green-600 mt-2">
                  {breakdown.savingsProgress}%
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleLearnMore('savingsProgress')}
              className="ml-4"
            >
              Learn More
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-blue-700">Logging Consistency (30%)</div>
                <div className="text-sm text-gray-600 mt-1">
                  How regularly you track your transactions
                </div>
                <div className="text-lg font-bold text-blue-600 mt-2">
                  {breakdown.loggingConsistency}%
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleLearnMore('loggingConsistency')}
              className="ml-4"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* How to Improve Your Score */}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="text-lg font-semibold text-gray-800 mb-4">How to improve your score:</div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Keep spending below 70% of your monthly income</li>
            <li>• Save at least 20% of your income each month</li>
            <li>• Log transactions regularly and consistently</li>
            <li>• Set and achieve realistic financial goals</li>
          </ul>
        </div>
      </div>
      
      {/* Floating Add Button */}
      <FloatingAddButton />

      {/* Modal */}
      <ScoreExplanationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        metric={selectedMetric}
        score={breakdown[selectedMetric]}
      />
    </div>
  );
};

export default MyScorePage;

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

import ScoreBreakdown from '@/components/ScoreBreakdown';

const MyScorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreChangeMessage, setScoreChangeMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);

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

        <h2 className="text-3xl font-bold text-[#102c54]">Your Virtual Credit Score</h2>

        {/* Score Display and Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Score Display */}
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <CreditScoreWidget size="large" showTitle={true} />
            </div>
            
            <div className="text-center">
              <Button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white px-6 py-3 text-lg font-semibold"
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
              <div className="text-sm text-gray-500 text-center">
                Last updated: {formatLastUpdated(creditScore.last_calculated)}
              </div>
            )}
          </div>

          {/* Right: Score Breakdown */}
          <div>
            <ScoreBreakdown />
          </div>
        </div>
      </div>
      
      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
};

export default MyScorePage;


import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
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

export const useCreditScore = () => {
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

  // Fetch credit score from database
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

  // Calculate credit score
  const calculateCreditScore = () => {
    if (!transactions.length) return { score: 650, breakdown: { savingsProgress: 20, spendingControl: 30, loggingConsistency: 50 } };

    let score = 650;
    
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

  // Score color and label functions
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

  // Recalculate function
  const recalculateScore = async () => {
    if (!user?.id) return;
    
    try {
      const newScore = calculateCreditScore();
      
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
        return;
      }
      
      await refetchCreditScore();
      return newScore.score;
    } catch (error) {
      console.error('Error recalculating score:', error);
    }
  };

  return {
    currentScore,
    breakdown,
    getScoreColor,
    getScoreLabel,
    recalculateScore,
    creditScore
  };
};

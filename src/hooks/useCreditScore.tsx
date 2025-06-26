
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const useCreditScore = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Fetch transactions for the current month
  const { data: monthlyTransactions } = useQuery({
    queryKey: ['monthlyTransactions', user?.id, firstDayOfMonth, lastDayOfMonth],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(firstDayOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(lastDayOfMonth, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data;
    },
  });

  // Fetch user's goals
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

      return data;
    },
  });

  const income = monthlyTransactions?.filter(t => t.type === 'income') || [];
  const expenses = monthlyTransactions?.filter(t => t.type === 'expense') || [];

  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpenses;

  const calculateScore = () => {
    let score = 50; // Start with a base score

    // Increase score for saving
    if (savings > 0) {
      score += 20;
    }

    // Increase score if expenses are below 80% of income
    if (totalExpenses < 0.8 * totalIncome) {
      score += 15;
    }

    // Increase score if savings goal is set
    if (goals?.monthly_saving_goal) {
      score += 15;
    }

    // Reduce score if expenses exceed income
    if (totalExpenses > totalIncome) {
      score -= 30;
    }

    // Reduce score if no transactions added
    if (!monthlyTransactions?.length) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score)); // Ensure score is within 0-100 range
  };

  const score = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'POOR';
  };

  const recalculateScore = async () => {
    // Invalidate and refetch all related queries
    await queryClient.invalidateQueries({ queryKey: ['monthlyTransactions'] });
    await queryClient.invalidateQueries({ queryKey: ['goals'] });
  };

  return {
    score,
    getScoreColor,
    getScoreLabel,
    recalculateScore,
    totalIncome,
    totalExpenses,
    savings,
    goals
  };
};

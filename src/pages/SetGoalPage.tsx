
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const SetGoalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [goalAmount, setGoalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing goal
  const { data: existingGoal } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching goals:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Set the input value when existing goal is loaded
  useState(() => {
    if (existingGoal?.monthly_saving_goal) {
      setGoalAmount(existingGoal.monthly_saving_goal.toString());
    }
  }, [existingGoal]);

  // Mutation to save goal
  const saveGoalMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (existingGoal) {
        // Update existing goal
        const { data, error } = await supabase
          .from('goals')
          .update({ 
            monthly_saving_goal: amount,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingGoal.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new goal
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            monthly_saving_goal: amount,
            last_updated: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      toast({
        title: "Goal Saved!",
        description: `Your monthly savings goal of $${goalAmount} has been saved.`,
      });
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
    onError: (error) => {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save your goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveGoal = () => {
    const amount = parseFloat(goalAmount);
    
    if (!goalAmount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    saveGoalMutation.mutate(amount);
  };

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
          <h1 className="text-3xl font-bold text-[#102c54]">Set Your Monthly Savings Goal</h1>
        </div>

        {/* Goal Setting Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="h-6 w-6" />
              Monthly Savings Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="goal-amount" className="text-lg font-medium text-gray-700">
                Goal Amount ($)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  $
                </span>
                <Input
                  id="goal-amount"
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 text-lg h-12 border-2 border-gray-200 focus:border-[#102c54]"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Try saving at least 10% of your income.
              </p>
            </div>

            <Button
              onClick={handleSaveGoal}
              disabled={saveGoalMutation.isPending || !goalAmount}
              className="w-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white h-12 text-lg font-medium"
            >
              {saveGoalMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Goal
                </div>
              )}
            </Button>

            {existingGoal && (
              <div className="text-center text-gray-600 text-sm">
                Current goal: ${existingGoal.monthly_saving_goal || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetGoalPage;


import { useState, useEffect } from 'react';
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
  const [monthlyAllowance, setMonthlyAllowance] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');

  // Fetch existing goals
  const { data: existingGoals } = useQuery({
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

  // Set the input values when existing goals are loaded
  useEffect(() => {
    if (existingGoals) {
      if (existingGoals.income_expectation) {
        setMonthlyAllowance(existingGoals.income_expectation.toString());
      }
      if (existingGoals.monthly_saving_goal) {
        setSavingsGoal(existingGoals.monthly_saving_goal.toString());
      }
    }
  }, [existingGoals]);

  // Mutation to save goals
  const saveGoalsMutation = useMutation({
    mutationFn: async ({ allowance, savings }: { allowance: number; savings: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (existingGoals) {
        // Update existing goals
        const { data, error } = await supabase
          .from('goals')
          .update({ 
            income_expectation: allowance,
            monthly_saving_goal: savings,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingGoals.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new goals
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            income_expectation: allowance,
            monthly_saving_goal: savings,
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
        title: "Goals Updated!",
        description: `Your monthly allowance of $${monthlyAllowance} and savings target of $${savingsGoal} have been saved.`,
      });
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
    onError: (error) => {
      console.error('Error saving goals:', error);
      toast({
        title: "Error",
        description: "Failed to save your goals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveGoals = () => {
    const allowance = parseFloat(monthlyAllowance);
    const savings = parseFloat(savingsGoal);
    
    if (!monthlyAllowance || isNaN(allowance) || allowance <= 0) {
      toast({
        title: "Invalid Allowance",
        description: "Please enter a valid monthly allowance greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (!savingsGoal || isNaN(savings) || savings <= 0) {
      toast({
        title: "Invalid Savings Goal",
        description: "Please enter a valid savings target greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (savings > allowance) {
      toast({
        title: "Invalid Goals",
        description: "Your savings target should be less than or equal to your allowance.",
        variant: "destructive",
      });
      return;
    }

    saveGoalsMutation.mutate({ allowance, savings });
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
          <h1 className="text-3xl font-bold text-[#102c54]">Set Your Monthly Goals</h1>
        </div>

        {/* Goals Setting Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="h-6 w-6" />
              Monthly Financial Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Monthly Allowance Section */}
            <div className="space-y-3">
              <Label htmlFor="monthly-allowance" className="text-lg font-medium text-gray-700">
                Monthly Allowance (د.إ)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  د.إ
                </span>
                <Input
                  id="monthly-allowance"
                  type="number"
                  value={monthlyAllowance}
                  onChange={(e) => setMonthlyAllowance(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 text-lg h-12 border-2 border-gray-200 focus:border-[#102c54]"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Savings Target Section */}
            <div className="space-y-3">
              <Label htmlFor="savings-goal" className="text-lg font-medium text-gray-700">
                Savings Target (د.إ)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                  د.إ
                </span>
                <Input
                  id="savings-goal"
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 text-lg h-12 border-2 border-gray-200 focus:border-[#102c54]"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Your savings target should be less than or equal to your allowance.
              </p>
            </div>

            <Button
              onClick={handleSaveGoals}
              disabled={saveGoalsMutation.isPending || !monthlyAllowance || !savingsGoal}
              className="w-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white h-12 text-lg font-medium"
            >
              {saveGoalsMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Goals
                </div>
              )}
            </Button>

            {existingGoals && (
              <div className="text-center text-gray-600 text-sm space-y-1">
                <div>Current allowance: د.إ{existingGoals.income_expectation || 0}</div>
                <div>Current savings target: د.إ{existingGoals.monthly_saving_goal || 0}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetGoalPage;

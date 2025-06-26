import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Target, TrendingUp, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import FloatingAddButton from '@/components/FloatingAddButton';

const SetGoalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [monthlySavingGoal, setMonthlySavingGoal] = useState('');
  const [incomeExpectation, setIncomeExpectation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Set the input values when existing goals are loaded - FIXED MAPPING
  useEffect(() => {
    if (existingGoals) {
      // Fix the mapping: income_expectation goes to Monthly Allowance, monthly_saving_goal goes to Savings Target
      if (existingGoals.income_expectation) {
        setIncomeExpectation(existingGoals.income_expectation.toString());
      }
      if (existingGoals.monthly_saving_goal) {
        setMonthlySavingGoal(existingGoals.monthly_saving_goal.toString());
      }
    }
  }, [existingGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monthlySavingGoal || !incomeExpectation || !user?.id) {
      toast.error('Please fill in all fields');
      return;
    }

    const savingGoalNum = parseFloat(monthlySavingGoal);
    const incomeNum = parseFloat(incomeExpectation);

    if (savingGoalNum <= 0 || incomeNum <= 0) {
      toast.error('Please enter valid positive amounts');
      return;
    }

    if (savingGoalNum >= incomeNum) {
      toast.error('Savings goal cannot be greater than or equal to expected income');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          monthly_saving_goal: savingGoalNum,
          income_expectation: incomeNum,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving goals:', error);
        toast.error('Failed to save goals: ' + error.message);
        return;
      }

      toast.success(`Goals Updated! Allowance: ${incomeNum} د.إ, Savings: ${savingGoalNum} د.إ`);
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Implement logout logic here
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
                  value={incomeExpectation}
                  onChange={(e) => setIncomeExpectation(e.target.value)}
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
                  value={monthlySavingGoal}
                  onChange={(e) => setMonthlySavingGoal(e.target.value)}
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
              onClick={handleSubmit}
              disabled={isSubmitting || !monthlySavingGoal || !incomeExpectation}
              className="w-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white h-12 text-lg font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
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
      
      {/* Floating Add Button */}
      <FloatingAddButton />
    </div>
  );
};

export default SetGoalPage;

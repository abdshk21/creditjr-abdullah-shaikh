
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Target, TrendingUp, User, LogOut, PiggyBank, Plus, Minus, Settings, Mail } from 'lucide-react';
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

  // Emergency Fund states
  const [emergencyFundTarget, setEmergencyFundTarget] = useState('');
  const [emergencyFundAmount, setEmergencyFundAmount] = useState('');
  const [emergencyFundReason, setEmergencyFundReason] = useState('');
  const [setTargetDialogOpen, setSetTargetDialogOpen] = useState(false);
  const [addFundDialogOpen, setAddFundDialogOpen] = useState(false);
  const [deductFundDialogOpen, setDeductFundDialogOpen] = useState(false);

  // Expense Envelope states
  const [selectedEnvelope, setSelectedEnvelope] = useState<string | null>(null);
  const [envelopeTargets, setEnvelopeTargets] = useState<Record<string, number>>({});
  const [envelopeTarget, setEnvelopeTarget] = useState('');
  const [envelopeDialogOpen, setEnvelopeDialogOpen] = useState(false);

  const envelopeCategories = [
    { name: 'Food', icon: '🍽️' },
    { name: 'Transport', icon: '🚗' },
    { name: 'Education', icon: '📚' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Gifts', icon: '🎁' },
    { name: 'Miscellaneous', icon: '📦' }
  ];

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

  // Fetch transactions for envelope progress calculation
  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate current month spending by category
  const getCurrentMonthSpending = (category: string) => {
    if (!transactions) return 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               transaction.category?.toLowerCase() === category.toLowerCase();
      })
      .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  };

  // Set the input values when existing goals are loaded
  useEffect(() => {
    if (existingGoals) {
      if (existingGoals.income_expectation) {
        setIncomeExpectation(existingGoals.income_expectation.toString());
      }
      if (existingGoals.monthly_saving_goal) {
        setMonthlySavingGoal(existingGoals.monthly_saving_goal.toString());
      }
      // Load envelope targets if stored in category_limits
      if (existingGoals.category_limits) {
        setEnvelopeTargets(existingGoals.category_limits as Record<string, number>);
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
          category_limits: envelopeTargets,
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

  const handleSetTarget = async () => {
    if (!emergencyFundTarget || !user?.id) {
      toast.error('Please enter a target amount');
      return;
    }

    const targetNum = parseFloat(emergencyFundTarget);
    if (targetNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    // TODO: Save to Supabase when database is ready
    toast.success(`Emergency Fund Target set to د.إ${targetNum}`);
    setSetTargetDialogOpen(false);
    setEmergencyFundTarget('');
  };

  const handleAddToFund = async () => {
    if (!emergencyFundAmount || !emergencyFundReason || !user?.id) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(emergencyFundAmount);
    if (amountNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    // TODO: Save to Supabase when database is ready
    toast.success(`Added د.إ${amountNum} to Emergency Fund`);
    setAddFundDialogOpen(false);
    setEmergencyFundAmount('');
    setEmergencyFundReason('');
  };

  const handleDeductFromFund = async () => {
    if (!emergencyFundAmount || !emergencyFundReason || !user?.id) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(emergencyFundAmount);
    if (amountNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    // TODO: Save to Supabase when database is ready
    toast.success(`Deducted د.إ${amountNum} from Emergency Fund`);
    setDeductFundDialogOpen(false);
    setEmergencyFundAmount('');
    setEmergencyFundReason('');
  };

  const handleEnvelopeClick = (categoryName: string) => {
    setSelectedEnvelope(categoryName);
    setEnvelopeTarget(envelopeTargets[categoryName]?.toString() || '');
    setEnvelopeDialogOpen(true);
  };

  const handleSaveEnvelopeTarget = async () => {
    if (!selectedEnvelope || !envelopeTarget || !user?.id) {
      toast.error('Please enter a target amount');
      return;
    }

    const targetNum = parseFloat(envelopeTarget);
    if (targetNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    const newTargets = {
      ...envelopeTargets,
      [selectedEnvelope]: targetNum
    };

    setEnvelopeTargets(newTargets);

    try {
      const { error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          monthly_saving_goal: parseFloat(monthlySavingGoal) || null,
          income_expectation: parseFloat(incomeExpectation) || null,
          category_limits: newTargets,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving envelope target:', error);
        toast.error('Failed to save target: ' + error.message);
        return;
      }

      toast.success(`${selectedEnvelope} target set to د.إ${targetNum}`);
    } catch (error) {
      console.error('Error saving envelope target:', error);
      toast.error('Failed to save target. Please try again.');
    }

    setEnvelopeDialogOpen(false);
    setSelectedEnvelope(null);
    setEnvelopeTarget('');
  };

  const getProgressColor = (progress: number) => {
    if (progress < 35) return 'bg-green-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressPercentage = (category: string) => {
    const target = envelopeTargets[category];
    if (!target) return 0;
    
    const spent = getCurrentMonthSpending(category);
    return Math.min((spent / target) * 100, 100);
  };

  const handleLogout = () => {
    // Implement logout logic here
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Goals Setting and Emergency Fund */}
          <div className="xl:col-span-2 space-y-6">
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

            {/* Emergency Fund Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3">
                  <PiggyBank className="h-6 w-6" />
                  Emergency Fund
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-800 mb-2">د.إ 0.00</div>
                  <div className="text-sm text-gray-600">Current Balance</div>
                  <div className="text-xs text-gray-500 mt-1">Target: د.إ 0.00</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Set Target Button */}
                  <Dialog open={setTargetDialogOpen} onOpenChange={setSetTargetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Set Target
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Emergency Fund Target</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="target-amount">Target Amount (د.إ)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.إ</span>
                            <Input
                              id="target-amount"
                              type="number"
                              value={emergencyFundTarget}
                              onChange={(e) => setEmergencyFundTarget(e.target.value)}
                              placeholder="0.00"
                              className="pl-12"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSetTargetDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSetTarget} className="bg-blue-600 hover:bg-blue-700">
                            Set Target
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Add to Fund Button */}
                  <Dialog open={addFundDialogOpen} onOpenChange={setAddFundDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white h-12 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add to Fund
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Emergency Fund</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-amount">Amount to Add (د.إ)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.إ</span>
                            <Input
                              id="add-amount"
                              type="number"
                              value={emergencyFundAmount}
                              onChange={(e) => setEmergencyFundAmount(e.target.value)}
                              placeholder="0.00"
                              className="pl-12"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-reason">Reason for Addition</Label>
                          <Textarea
                            id="add-reason"
                            value={emergencyFundReason}
                            onChange={(e) => setEmergencyFundReason(e.target.value)}
                            placeholder="Why are you adding to your emergency fund?"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setAddFundDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddToFund} className="bg-green-600 hover:bg-green-700">
                            Add to Fund
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Deduct from Fund Button */}
                  <Dialog open={deductFundDialogOpen} onOpenChange={setDeductFundDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white h-12 flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        Deduct from Fund
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deduct from Emergency Fund</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="deduct-amount">Amount to Deduct (د.إ)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.إ</span>
                            <Input
                              id="deduct-amount"
                              type="number"
                              value={emergencyFundAmount}
                              onChange={(e) => setEmergencyFundAmount(e.target.value)}
                              placeholder="0.00"
                              className="pl-12"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deduct-reason">Reason for Deduction</Label>
                          <Textarea
                            id="deduct-reason"
                            value={emergencyFundReason}
                            onChange={(e) => setEmergencyFundReason(e.target.value)}
                            placeholder="Why are you using your emergency fund?"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setDeductFundDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleDeductFromFund} className="bg-red-600 hover:bg-red-700">
                            Deduct from Fund
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-orange-700 text-sm">
                    🚨 <strong>Emergency Fund Tip:</strong> Aim for 3-6 months of expenses. Use only for true emergencies like medical bills or job loss.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Expense Envelope */}
          <div className="xl:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-3 justify-center">
                  <Mail className="h-6 w-6" />
                  Expense Envelope
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {envelopeCategories.map((category) => {
                    const progress = getProgressPercentage(category.name);
                    const spent = getCurrentMonthSpending(category.name);
                    const target = envelopeTargets[category.name] || 0;
                    
                    return (
                      <div
                        key={category.name}
                        onClick={() => handleEnvelopeClick(category.name)}
                        className="cursor-pointer group"
                      >
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200 group-hover:scale-105">
                          <div className="text-center">
                            <div className="text-4xl mb-2">{category.icon}</div>
                            <div className="text-sm font-medium text-gray-700 mb-2">{category.name}</div>
                            {target > 0 && (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-500">
                                  د.إ{spent.toFixed(0)} / د.إ{target}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {target === 0 && (
                              <div className="text-xs text-gray-400">Tap to set target</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Envelope Target Setting Dialog */}
        <Dialog open={envelopeDialogOpen} onOpenChange={setEnvelopeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEnvelope} Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="envelope-target">Monthly Target (د.إ)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">د.إ</span>
                  <Input
                    id="envelope-target"
                    type="number"
                    value={envelopeTarget}
                    onChange={(e) => setEnvelopeTarget(e.target.value)}
                    placeholder="0.00"
                    className="pl-12"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {selectedEnvelope && envelopeTargets[selectedEnvelope] && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Current Progress</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent this month</span>
                      <span>د.إ{getCurrentMonthSpending(selectedEnvelope).toFixed(2)} / د.إ{envelopeTargets[selectedEnvelope]}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(selectedEnvelope))}`}
                        style={{ width: `${Math.min(getProgressPercentage(selectedEnvelope), 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-gray-600">
                      {getProgressPercentage(selectedEnvelope).toFixed(1)}% of target used
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEnvelopeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEnvelopeTarget} className="bg-purple-600 hover:bg-purple-700">
                  Save Target
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <FloatingAddButton />
    </div>
  );
};

export default SetGoalPage;

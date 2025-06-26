import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, RefreshCw, DollarSign, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Confetti from '@/components/Confetti';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
}

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamic categories based on transaction type
  const expenseCategories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Personal Care',
    'Travel',
    'Other'
  ];

  const incomeCategories = [
    'Pocket Money',
    'Gift',
    'Freelance',
    'Allowance',
    'Bonus',
    'Sale',
    'Other Income'
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const isValidAmount = (value: string): boolean => {
    const regex = /^\d+(\.\d{0,2})?$/;
    return regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Please log in to add transactions');
      return;
    }

    if (!amount || !category || !date) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          category,
          description: description || null,
          type,
          date,
          affects_score: true
        });

      if (error) {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
        return;
      }

      // Trigger confetti for income transactions
      if (type === 'income') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Show success message
      alert(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 pb-24">
      {/* Confetti Component */}
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="max-w-2xl mx-auto space-y-6">
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
                  <h1 className="text-3xl font-bold text-white">Add Transaction</h1>
                  <p className="text-white/80">Track your income and expenses</p>
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

        {/* Transaction Form */}
        <Card className="shadow-lg border-0 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-[#102c54] flex items-center gap-2">
              <Plus className="h-6 w-6" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#102c54] font-semibold">Transaction Type *</Label>
                <Select value={type} onValueChange={(value: 'income' | 'expense') => {
                  setType(value);
                  setCategory(''); // Reset category when type changes
                }}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#102c54]">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[#102c54] font-semibold">Amount (د.إ) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 border-2 border-gray-200 focus:border-[#102c54]"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#102c54] font-semibold">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#102c54]">
                    <SelectValue placeholder={`Select ${type} category`} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#102c54] font-semibold">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="border-2 border-gray-200 focus:border-[#102c54]"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#102c54] font-semibold">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#102c54]"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#102c54] to-[#1e3a72] hover:from-[#1e3a72] hover:to-[#2d4f8a] text-white py-3 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Adding Transaction...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add {type === 'income' ? 'Income' : 'Expense'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTransactionPage;

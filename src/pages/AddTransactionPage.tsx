import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, UtensilsCrossed, Car, BookOpen, Gamepad2, Gift, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Confetti from '@/components/Confetti';

const AddTransactionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const expenseCategories = [
    { value: 'Food', label: 'Food', icon: UtensilsCrossed },
    { value: 'Transport', label: 'Transport', icon: Car },
    { value: 'Education', label: 'Education', icon: BookOpen },
    { value: 'Entertainment', label: 'Entertainment', icon: Gamepad2 },
    { value: 'Gifts', label: 'Gifts', icon: Gift },
    { value: 'Misc', label: 'Misc', icon: DollarSign }
  ];

  const incomeCategories = [
    { value: 'Pocket Money', label: 'Pocket Money', icon: DollarSign },
    { value: 'Gift', label: 'Gift', icon: Gift },
    { value: 'Freelance', label: 'Freelance', icon: DollarSign },
    { value: 'Allowance', label: 'Allowance', icon: DollarSign },
    { value: 'Bonus', label: 'Bonus', icon: DollarSign },
    { value: 'Sale', label: 'Sale', icon: DollarSign },
    { value: 'Other Income', label: 'Other Income', icon: DollarSign }
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !user?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(amount),
            type: type,
            category: category,
            description: description || null,
            date: format(date, 'yyyy-MM-dd'),
            affects_score: type === 'expense'
          }
        ]);

      if (error) {
        console.error('Error inserting transaction:', error);
        toast.error('Failed to save transaction: ' + error.message);
        return;
      }

      // Clear form
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date());

      if (type === 'income') {
        // Show confetti for income
        setShowConfetti(true);
        toast.success('Nice! You earned some extra د.إ today! 🎉');
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        toast.success('✅ Transaction saved!');
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      {showConfetti && <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />}
      
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
          <h1 className="text-3xl font-bold text-[#102c54]">Add Transaction</h1>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#102c54]">Transaction Type</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={type === 'expense' ? 'default' : 'outline'}
                    onClick={() => {
                      setType('expense');
                      setCategory(''); // Reset category when type changes
                    }}
                    className={cn(
                      "flex-1 py-3 text-base font-semibold",
                      type === 'expense' 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "border-red-600 text-red-600 hover:bg-red-50"
                    )}
                  >
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'income' ? 'default' : 'outline'}
                    onClick={() => {
                      setType('income');
                      setCategory(''); // Reset category when type changes
                    }}
                    className={cn(
                      "flex-1 py-3 text-base font-semibold",
                      type === 'income' 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "border-green-600 text-green-600 hover:bg-green-50"
                    )}
                  >
                    Income
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#102c54]">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-600">
                    د.إ
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg border-2 focus:border-[#d8a434] pl-12"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#102c54]">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="border-2 focus:border-[#d8a434]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#102c54]">Description (Optional)</Label>
                <Textarea
                  placeholder="Add a note about this transaction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border-2 focus:border-[#d8a434]"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-base font-semibold text-[#102c54]">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-2 hover:border-[#d8a434]",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-2" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white py-3 text-lg font-semibold h-12"
              >
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTransactionPage;

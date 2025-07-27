
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getSelectedCurrency } from '@/lib/currency';

interface Transaction {
  amount: number;
  category: string;
  note: string;
  date: string;
  wallet: string;
  type: 'inflow' | 'outflow';
}

interface AddTransactionProps {
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const AddTransaction = ({ onSave, onCancel }: AddTransactionProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [wallet, setWallet] = useState('');
  const [customCategories, setCustomCategories] = useState<{category_name: string}[]>([]);

  // Fetch custom categories
  useEffect(() => {
    const fetchCustomCategories = async () => {
      if (!user?.id) return;
      
      try {
        // Use raw query to avoid TypeScript complexity
        const { data } = await (supabase as any)
          .from('custom_categories')
          .select('category_name')
          .eq('user_id', user.id)
          .eq('type', 'expense');
        
        if (data) {
          setCustomCategories(data);
        }
      } catch (err) {
        console.error('Error fetching custom categories:', err);
      }
    };

    fetchCustomCategories();
  }, [user?.id]);

  const defaultCategories = [
    { value: 'Food', label: 'Food', icon: '🍽️' },
    { value: 'Transport', label: 'Transport', icon: '🚗' },
    { value: 'Education', label: 'Education', icon: '📚' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'Gifts', label: 'Gifts', icon: '🎁' },
    { value: 'Misc', label: 'Misc', icon: '📝' },
    { value: 'Payday', label: 'Payday', icon: '💰' }
  ];

  // Combine default and custom categories
  const allCategories = [
    ...defaultCategories,
    ...customCategories.map((cat: any) => ({ 
      value: cat.category_name || '', 
      label: cat.category_name || '', 
      icon: '📂' // Default icon for custom categories
    }))
  ];

  const wallets = [
    { value: 'Orange Wallet', label: 'Orange Wallet' },
    { value: 'Debit Card', label: 'Debit Card' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !wallet) {
      return; // Basic validation
    }

    const transaction: Transaction = {
      amount: parseFloat(amount),
      category,
      note,
      date: format(date, 'yyyy-MM-dd'),
      wallet,
      type: category === 'Payday' ? 'inflow' : 'outflow'
    };

    onSave(transaction);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-blue-600"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
        </div>

        {/* Form */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount ({getSelectedCurrency().symbol})</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Note (Optional)</label>
                <Textarea
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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

              {/* Wallet */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Wallet</label>
                <Select value={wallet} onValueChange={setWallet} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                Save Transaction
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTransaction;

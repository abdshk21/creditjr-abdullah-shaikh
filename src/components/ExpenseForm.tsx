
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UtensilsCrossed, ShoppingBag, Gamepad2, Car, BookOpen, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  expenses: Expense[];
}

const categories = [
  { value: 'Food & Dining', icon: UtensilsCrossed },
  { value: 'Shopping', icon: ShoppingBag },
  { value: 'Entertainment', icon: Gamepad2 },
  { value: 'Transportation', icon: Car },
  { value: 'Education', icon: BookOpen },
  { value: 'Other', icon: DollarSign },
];

const ExpenseForm = ({ onAddExpense, expenses }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseFloat(amount),
      category,
      description,
      date,
    };

    onAddExpense(newExpense);
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);

    toast({
      title: "Expense Added!",
      description: `Successfully logged $${amount} for ${category}.`,
    });
  };

  const recentExpenses = expenses.slice(-10).reverse();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Add New Expense</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{cat.value}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What did you spend money on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const categoryIcon = categories.find(cat => cat.value === expense.category)?.icon || DollarSign;
              const Icon = categoryIcon;
              
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600">-${expense.amount.toFixed(2)}</span>
                </div>
              );
            })}
            {recentExpenses.length === 0 && (
              <p className="text-sm text-muted-foreground">No expenses logged yet. Add your first expense above!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;

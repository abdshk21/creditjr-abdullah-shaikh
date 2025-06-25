
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface GoalsProps {
  expenses: Expense[];
  monthlyBudget: number;
  onUpdateBudget: (budget: number) => void;
}

const Goals = ({ expenses, monthlyBudget, onUpdateBudget }: GoalsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBudget, setEditBudget] = useState(monthlyBudget.toString());
  const { toast } = useToast();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetProgress = (totalSpent / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - totalSpent;

  const categoryGoals = {
    'Food & Dining': monthlyBudget * 0.3,
    'Shopping': monthlyBudget * 0.2,
    'Entertainment': monthlyBudget * 0.15,
    'Transportation': monthlyBudget * 0.15,
    'Education': monthlyBudget * 0.1,
    'Other': monthlyBudget * 0.1,
  };

  const categorySpending = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSaveBudget = () => {
    const newBudget = parseFloat(editBudget);
    if (newBudget > 0) {
      onUpdateBudget(newBudget);
      setIsEditing(false);
      toast({
        title: "Budget Updated!",
        description: `Your monthly budget is now $${newBudget}.`,
      });
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 70) return 'bg-green-500';
    if (progress <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressMessage = (progress: number) => {
    if (progress <= 50) return "Great job! You're doing excellent with your budget.";
    if (progress <= 75) return "Good progress! Keep an eye on your spending.";
    if (progress <= 90) return "Warning: You're getting close to your budget limit.";
    return "Over budget! Consider reviewing your spending habits.";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Monthly Budget Goal</span>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleSaveBudget}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditBudget(monthlyBudget.toString());
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="text-3xl font-bold text-center">${monthlyBudget}</div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                placeholder="Enter your monthly budget"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spent this month</span>
              <span>${totalSpent.toFixed(2)} / ${monthlyBudget}</span>
            </div>
            <div className="relative">
              <Progress value={budgetProgress} className="h-4" />
              <div className={`absolute inset-0 h-4 rounded-full ${getProgressColor(budgetProgress)} transition-all duration-300`} 
                   style={{ width: `${Math.min(budgetProgress, 100)}%` }} />
            </div>
            <p className="text-sm text-center font-medium">
              {getProgressMessage(budgetProgress)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-green-600">${remainingBudget.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-blue-600">{budgetProgress.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryGoals).map(([category, goal]) => {
              const spent = categorySpending[category] || 0;
              const progress = (spent / goal) * 100;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${spent.toFixed(2)} / ${goal.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={progress} className="h-2" />
                    <div className={`absolute inset-0 h-2 rounded-full ${getProgressColor(progress)} transition-all duration-300`} 
                         style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  {progress > 100 && (
                    <p className="text-xs text-red-600">
                      Over budget by ${(spent - goal).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;

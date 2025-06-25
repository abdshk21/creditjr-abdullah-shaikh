
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingDown, TrendingUp, Target } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface DashboardProps {
  expenses: Expense[];
  monthlyBudget: number;
}

const Dashboard = ({ expenses, monthlyBudget }: DashboardProps) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetProgress = (totalSpent / monthlyBudget) * 100;

  const categoryTotals = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const recentExpenses = expenses.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyBudget}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${remainingBudget.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetProgress.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Spending</span>
                <span>${totalSpent.toFixed(2)} / ${monthlyBudget}</span>
              </div>
              <Progress 
                value={budgetProgress} 
                className="h-3"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {remainingBudget > 0 
                ? `You have $${remainingBudget.toFixed(2)} left this month!`
                : `You're $${Math.abs(remainingBudget).toFixed(2)} over budget this month.`
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground">${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(categoryTotals).length === 0 && (
                <p className="text-sm text-muted-foreground">No expenses this month yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                </div>
                <span className="font-bold text-red-600">-${expense.amount.toFixed(2)}</span>
              </div>
            ))}
            {recentExpenses.length === 0 && (
              <p className="text-sm text-muted-foreground">No transactions yet. Start by adding an expense!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

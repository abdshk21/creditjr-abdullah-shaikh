
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb, Target } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface AIInsightsProps {
  expenses: Expense[];
  monthlyBudget: number;
}

const AIInsights = ({ expenses, monthlyBudget }: AIInsightsProps) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const utilizationRate = totalSpent / monthlyBudget;

  const categorySpending = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
  const averageTransaction = monthlyExpenses.length > 0 ? totalSpent / monthlyExpenses.length : 0;

  // Generate AI insights based on spending patterns
  const generateInsights = () => {
    const insights = [];

    // Budget adherence insight
    if (utilizationRate <= 0.5) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Excellent Budget Control!',
        message: `You've only used ${(utilizationRate * 100).toFixed(1)}% of your monthly budget. This shows great self-control and planning skills!`,
        color: 'green'
      });
    } else if (utilizationRate <= 0.8) {
      insights.push({
        type: 'neutral',
        icon: TrendingUp,
        title: 'Good Budget Management',
        message: `You're at ${(utilizationRate * 100).toFixed(1)}% of your budget. You're doing well, but keep an eye on remaining expenses this month.`,
        color: 'blue'
      });
    } else if (utilizationRate <= 1.0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Approaching Budget Limit',
        message: `You've used ${(utilizationRate * 100).toFixed(1)}% of your budget. Consider reducing discretionary spending for the rest of the month.`,
        color: 'yellow'
      });
    } else {
      insights.push({
        type: 'negative',
        icon: AlertTriangle,
        title: 'Over Budget Alert',
        message: `You're ${((utilizationRate - 1) * 100).toFixed(1)}% over budget. Review your spending habits and consider adjusting your budget or reducing expenses.`,
        color: 'red'
      });
    }

    // Category spending insight
    if (topCategory && topCategory[1] > monthlyBudget * 0.4) {
      insights.push({
        type: 'warning',
        icon: Target,
        title: 'High Category Spending',
        message: `${topCategory[0]} accounts for $${topCategory[1].toFixed(2)} of your spending. Consider setting a specific limit for this category.`,
        color: 'orange'
      });
    }

    // Transaction pattern insight
    if (averageTransaction < 20) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Smart Small Purchases',
        message: `Your average transaction is $${averageTransaction.toFixed(2)}, showing you're mindful of small purchases. This is a great habit!`,
        color: 'green'
      });
    } else if (averageTransaction > 100) {
      insights.push({
        type: 'neutral',
        icon: Lightbulb,
        title: 'Large Transaction Pattern',
        message: `Your average transaction is $${averageTransaction.toFixed(2)}. Consider if these larger purchases align with your financial goals.`,
        color: 'purple'
      });
    }

    // Spending frequency insight
    if (monthlyExpenses.length > 30) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Frequent Spending',
        message: `You've made ${monthlyExpenses.length} transactions this month. Try to consolidate purchases to reduce impulse spending.`,
        color: 'orange'
      });
    } else if (monthlyExpenses.length < 10) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Disciplined Spending',
        message: `You've made only ${monthlyExpenses.length} transactions this month, showing great spending discipline!`,
        color: 'green'
      });
    }

    return insights;
  };

  const tips = [
    "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
    "Before buying something, wait 24 hours to avoid impulse purchases",
    "Track your spending daily to stay aware of your habits",
    "Set up automatic savings to build your emergency fund",
    "Use the envelope method to limit spending in each category",
    "Compare prices before making purchases over $50",
    "Consider if purchases bring long-term value or just temporary satisfaction"
  ];

  const insights = generateInsights();
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-50 border-green-200 text-green-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Financial Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getColorClasses(insight.color)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{insight.title}</h3>
                      <p className="text-sm">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {insights.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start logging expenses to receive personalized insights!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Daily Financial Tip</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">{randomTip}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{monthlyExpenses.length}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Transaction</p>
              <p className="text-2xl font-bold">${averageTransaction.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Top Category</p>
              <p className="text-2xl font-bold">{topCategory ? topCategory[0] : 'None'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {utilizationRate <= 0.5 ? 'A+' : 
                 utilizationRate <= 0.7 ? 'A' :
                 utilizationRate <= 0.9 ? 'B' :
                 utilizationRate <= 1.0 ? 'C' : 'D'}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on budget adherence, spending patterns, and financial habits
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Control</span>
                <span>{utilizationRate <= 0.8 ? 'Excellent' : 'Needs Improvement'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Spending Consistency</span>
                <span>{monthlyExpenses.length > 0 ? 'Active' : 'No Data'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Category Diversity</span>
                <span>{Object.keys(categorySpending).length >= 3 ? 'Good' : 'Limited'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;

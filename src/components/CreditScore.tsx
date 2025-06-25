
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Info, Award, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface CreditScoreProps {
  expenses: Expense[];
  monthlyBudget: number;
}

const CreditScore = ({ expenses, monthlyBudget }: CreditScoreProps) => {
  // Calculate virtual credit score based on user behavior
  const calculateCreditScore = () => {
    let score = 650; // Starting score
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const utilizationRate = totalSpent / monthlyBudget;
    
    // Payment History (35%) - based on staying under budget
    if (utilizationRate <= 0.3) score += 100;
    else if (utilizationRate <= 0.7) score += 50;
    else if (utilizationRate <= 1.0) score += 0;
    else score -= 50;
    
    // Credit Utilization (30%) - based on spending vs budget
    if (utilizationRate <= 0.1) score += 80;
    else if (utilizationRate <= 0.3) score += 60;
    else if (utilizationRate <= 0.5) score += 40;
    else if (utilizationRate <= 0.7) score += 20;
    else score -= 20;
    
    // Length of Credit History (15%) - days using app
    const daysUsing = Math.min(expenses.length * 2, 30); // Simulate usage days
    score += daysUsing;
    
    // Credit Mix (10%) - variety in spending categories
    const uniqueCategories = new Set(expenses.map(e => e.category)).size;
    score += uniqueCategories * 5;
    
    // New Credit (10%) - recent spending patterns
    const recentExpenses = expenses.slice(-10);
    if (recentExpenses.length > 0) {
      const avgRecentSpending = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / recentExpenses.length;
      if (avgRecentSpending < 50) score += 20;
      else if (avgRecentSpending < 100) score += 10;
    }
    
    return Math.max(300, Math.min(850, Math.round(score)));
  };

  const creditScore = calculateCreditScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 740) return 'text-green-500';
    if (score >= 670) return 'text-yellow-500';
    if (score >= 580) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const getScoreAdvice = (score: number) => {
    if (score >= 800) return "Fantastic! You're demonstrating excellent financial habits.";
    if (score >= 740) return "Great job! Keep up these good financial practices.";
    if (score >= 670) return "Good work! A few improvements could boost your score even higher.";
    if (score >= 580) return "You're on the right track. Focus on staying under budget consistently.";
    return "Don't worry! Small changes in your spending habits can make a big difference.";
  };

  const scoreFactors = [
    {
      name: 'Payment History',
      weight: 35,
      description: 'Meeting your monthly budget goals consistently',
      score: creditScore >= 700 ? 'Good' : creditScore >= 600 ? 'Fair' : 'Needs Work'
    },
    {
      name: 'Credit Utilization',
      weight: 30,
      description: 'How much of your budget you actually spend',
      score: creditScore >= 700 ? 'Good' : creditScore >= 600 ? 'Fair' : 'Needs Work'
    },
    {
      name: 'Length of History',
      weight: 15,
      description: 'How long you\'ve been tracking your finances',
      score: expenses.length >= 20 ? 'Good' : expenses.length >= 10 ? 'Fair' : 'Building'
    },
    {
      name: 'Credit Mix',
      weight: 10,
      description: 'Variety in your spending categories',
      score: new Set(expenses.map(e => e.category)).size >= 4 ? 'Good' : 'Building'
    },
    {
      name: 'New Credit',
      weight: 10,
      description: 'Recent spending patterns and consistency',
      score: creditScore >= 650 ? 'Good' : 'Building'
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Virtual Credit Score</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">This is a simulated score based on your spending habits. Real credit scores consider different factors.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(creditScore)}`}>
                {creditScore}
              </div>
              <div className="text-lg font-medium text-muted-foreground">
                {getScoreLabel(creditScore)}
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-sm">{getScoreAdvice(creditScore)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Score Range</span>
                <span>300 - 850</span>
              </div>
              <Progress value={((creditScore - 300) / 550) * 100} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreFactors.map((factor) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{factor.name}</span>
                      <span className="text-sm text-muted-foreground">({factor.weight}%)</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{factor.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        factor.score === 'Good' ? 'text-green-600' :
                        factor.score === 'Fair' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {factor.score}
                      </span>
                      {factor.score === 'Good' && <Award className="h-4 w-4 text-green-600" />}
                      {factor.score === 'Needs Work' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                    </div>
                  </div>
                  <Progress 
                    value={factor.score === 'Good' ? 100 : factor.score === 'Fair' ? 60 : 30} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improve Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Stay Under Budget</p>
                  <p className="text-sm text-blue-700">Consistently spending less than your monthly budget improves your payment history.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Diversify Spending</p>
                  <p className="text-sm text-green-700">Spending across different categories shows good financial management.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Keep Tracking</p>
                  <p className="text-sm text-purple-700">The longer you track your finances, the better your credit history becomes.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default CreditScore;

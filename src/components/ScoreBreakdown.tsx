
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import { useCreditScore } from '@/hooks/useCreditScore';

const ScoreBreakdown = () => {
  const { breakdown, currentScore } = useCreditScore();

  const getScoreDescription = (score: number) => {
    if (score >= 700) return 'Excellent financial habits! Keep it up!';
    if (score >= 580) return 'Good progress, but room for improvement.';
    return 'Focus on improving your financial habits.';
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-100';
    if (value >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-[#102c54] flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-[#102c54] mb-2">How Your Score is Calculated</h3>
          <p className="text-sm text-gray-600">{getScoreDescription(currentScore)}</p>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getMetricBgColor(breakdown.spendingControl)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#102c54]" />
                <span className="font-semibold">Spending Control</span>
              </div>
              <span className={`font-bold ${getMetricColor(breakdown.spendingControl)}`}>
                {breakdown.spendingControl}%
              </span>
            </div>
            <p className="text-xs text-gray-600">
              How well you manage your expenses relative to your income (40% of score)
            </p>
          </div>

          <div className={`p-4 rounded-lg ${getMetricBgColor(breakdown.savingsProgress)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#102c54]" />
                <span className="font-semibold">Savings Progress</span>
              </div>
              <span className={`font-bold ${getMetricColor(breakdown.savingsProgress)}`}>
                {breakdown.savingsProgress}%
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Progress towards your monthly savings goal (30% of score)
            </p>
          </div>

          <div className={`p-4 rounded-lg ${getMetricBgColor(breakdown.loggingConsistency)}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#102c54]" />
                <span className="font-semibold">Logging Consistency</span>
              </div>
              <span className={`font-bold ${getMetricColor(breakdown.loggingConsistency)}`}>
                {breakdown.loggingConsistency}%
              </span>
            </div>
            <p className="text-xs text-gray-600">
              How regularly you track your transactions (30% of score)
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-[#102c54] mb-2">Tips to Improve:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Keep spending below 70% of your income</li>
            <li>• Set and achieve realistic savings goals</li>
            <li>• Log transactions regularly for better tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreBreakdown;

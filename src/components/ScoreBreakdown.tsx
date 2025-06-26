
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import { useCreditScore } from '@/hooks/useCreditScore';

const ScoreBreakdown = () => {
  const { breakdown } = useCreditScore();

  return (
    <Card className="shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50">
      <CardHeader>
        <CardTitle className="text-[#102c54] flex items-center gap-2 text-xl">
          <Info className="h-6 w-6" />
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-gray-600 mb-4">
          Your virtual credit score is calculated based on three key factors:
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-700">Spending Control (40%)</div>
              <div className="text-sm text-gray-600 mt-1">
                How well you stay within your monthly budget
              </div>
              <div className="text-lg font-bold text-red-600 mt-2">
                {breakdown.spendingControl}%
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <PiggyBank className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-green-700">Savings Progress (30%)</div>
              <div className="text-sm text-gray-600 mt-1">
                Progress towards your monthly savings goal
              </div>
              <div className="text-lg font-bold text-green-600 mt-2">
                {breakdown.savingsProgress}%
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-blue-700">Logging Consistency (30%)</div>
              <div className="text-sm text-gray-600 mt-1">
                How regularly you track your transactions
              </div>
              <div className="text-lg font-bold text-blue-600 mt-2">
                {breakdown.loggingConsistency}%
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">How to improve your score:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Keep spending below 70% of your monthly income</li>
            <li>• Save at least 20% of your income each month</li>
            <li>• Log transactions regularly and consistently</li>
            <li>• Set and achieve realistic financial goals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreBreakdown;

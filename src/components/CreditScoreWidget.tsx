
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';
import { useCreditScore } from '@/hooks/useCreditScore';

interface CreditScoreWidgetProps {
  showHeader?: boolean;
  compact?: boolean;
}

const CreditScoreWidget = ({ showHeader = true, compact = false }: CreditScoreWidgetProps) => {
  const { score, getScoreColor, getScoreLabel } = useCreditScore();

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  if (compact) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold" style={{ color: scoreColor }}>
                {score}
              </div>
              <div className="text-sm text-gray-600">{scoreLabel}</div>
            </div>
            <TrendingUp className="h-8 w-8" style={{ color: scoreColor }} />
          </div>
          <Progress value={score} className="mt-2 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      {showHeader && (
        <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
          <CardTitle className="text-xl">Financial Health Score</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2" style={{ color: scoreColor }}>
            {score}
          </div>
          <div className="text-lg font-semibold mb-4" style={{ color: scoreColor }}>
            {scoreLabel}
          </div>
          <Progress value={score} className="h-4" />
          <div className="mt-4 text-center text-sm text-gray-600">
            {score >= 70
              ? 'Great job! Keep up the excellent financial habits.'
              : score >= 40
                ? 'Good progress! There\'s room for improvement.'
                : 'Needs attention. Start tracking your expenses and set a budget.'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScoreWidget;

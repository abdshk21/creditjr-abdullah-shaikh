
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { useCreditScore } from '@/hooks/useCreditScore';

interface CreditScoreWidgetProps {
  size?: 'small' | 'large';
  showTitle?: boolean;
  className?: string;
}

const CreditScoreWidget = ({ size = 'small', showTitle = true, className = '' }: CreditScoreWidgetProps) => {
  const { currentScore, getScoreColor, getScoreLabel } = useCreditScore();

  const gaugeSize = size === 'large' ? 320 : 200;

  // Semi-circle gauge component
  const SemiCircleGauge = ({ score, size }: { score: number; size: number }) => {
    const radius = size / 2 - 20;
    const circumference = Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score - 300) / 550 * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 40} className="transform rotate-0">
          {/* Background arc */}
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score text - perfectly centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '20%' }}>
          <div className={`font-bold ${size === 320 ? 'text-4xl' : 'text-2xl'} text-center`} style={{ color: getScoreColor(score) }}>
            {score}
          </div>
          <div className={`font-medium text-gray-600 mt-1 ${size === 320 ? 'text-sm' : 'text-xs'} text-center`}>
            {getScoreLabel(score)}
          </div>
        </div>
      </div>
    );
  };

  if (size === 'small') {
    return (
      <Card 
        className={`shadow-lg border-0 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white ${className}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
          <Award className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentScore}</div>
          <p className="text-xs text-white/80">Virtual Score</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 ${className}`}>
      {showTitle && (
        <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Award className="h-7 w-7" />
            Current Score
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-8 text-center">
        <SemiCircleGauge score={currentScore} size={gaugeSize} />
      </CardContent>
    </Card>
  );
};

export default CreditScoreWidget;

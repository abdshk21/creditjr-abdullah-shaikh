
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, Info, ExternalLink } from 'lucide-react';
import { useCreditScore } from '@/hooks/useCreditScore';

interface CreditScoreWidgetProps {
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
}

const CreditScoreWidget = ({ size = 'medium', showTitle = false }: CreditScoreWidgetProps) => {
  const { score, tier, getScoreColor } = useCreditScore();
  const [exploreModalOpen, setExploreModalOpen] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          card: 'w-full max-w-sm',
          score: 'text-4xl',
          gauge: 'w-32 h-32',
          title: 'text-lg'
        };
      case 'large':
        return {
          card: 'w-full max-w-lg',
          score: 'text-6xl',
          gauge: 'w-48 h-48',
          title: 'text-2xl'
        };
      default:
        return {
          card: 'w-full max-w-md',
          score: 'text-5xl',
          gauge: 'w-40 h-40',
          title: 'text-xl'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const radius = size === 'large' ? 90 : size === 'small' ? 60 : 75;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  return (
    <>
      <Card className={`${sizeClasses.card} mx-auto shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100`}>
        {showTitle && (
          <CardHeader className="text-center pb-2">
            <CardTitle className={`${sizeClasses.title} text-[#102c54] flex items-center justify-center gap-2`}>
              <TrendingUp className="h-6 w-6" />
              Current Score
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Centered Score Display */}
            <div className="relative flex items-center justify-center">
              <svg className={`${sizeClasses.gauge} transform -rotate-90`} viewBox="0 0 200 200">
                {/* Background arc */}
                <path
                  d={`M 25 100 A ${radius} ${radius} 0 0 1 175 100`}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d={`M 25 100 A ${radius} ${radius} 0 0 1 175 100`}
                  fill="none"
                  stroke={getScoreColor(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray * 0.75}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Centered Score Number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${sizeClasses.score} font-bold text-[#102c54]`}>
                  {score}
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {tier}
                </span>
              </div>
            </div>

            {/* Explore the Metric Section - Only show on large size */}
            {size === 'large' && (
              <div className="w-full flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExploreModalOpen(true)}
                  className="text-[#102c54] hover:bg-yellow-200/50 text-sm font-medium"
                >
                  Explore the Metric
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Explore Modal */}
      <Dialog open={exploreModalOpen} onOpenChange={setExploreModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#102c54] flex items-center gap-2">
              <Info className="h-6 w-6" />
              Explore the Metric
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Learn more about how your credit score is calculated and what factors influence it.
            </p>
            <Button 
              onClick={() => window.open('https://drive.google.com/file/d/1hOFjBllnJQ1op-VMRHYf2ibCRU0OwbrT/view?usp=sharing', '_blank')}
              className="w-full bg-[#102c54] hover:bg-[#102c54]/90 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Detailed Guide
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreditScoreWidget;


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetGoalPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[#102c54] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-[#102c54]">Set Goal</h1>
        </div>

        {/* Coming Soon Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="h-6 w-6" />
              Financial Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">Coming Soon!</div>
            <div className="text-gray-400 text-sm">
              Set your savings goals and spending limits to improve your credit score.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetGoalPage;

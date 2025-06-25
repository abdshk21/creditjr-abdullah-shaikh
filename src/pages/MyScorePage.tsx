
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyScorePage = () => {
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
          <h1 className="text-3xl font-bold text-[#102c54]">My Credit Score</h1>
        </div>

        {/* Coming Soon Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#d8a434] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Award className="h-6 w-6" />
              Credit Score Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">Coming Soon!</div>
            <div className="text-gray-400 text-sm">
              View your detailed credit score breakdown and track your progress over time.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyScorePage;

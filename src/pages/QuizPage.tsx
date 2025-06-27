
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
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
          <h1 className="text-3xl font-bold text-[#102c54]">Quiz</h1>
        </div>

        {/* Coming Soon Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-[#102c54] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#102c54] mb-2">Coming Soon!</h2>
            <p className="text-gray-600">
              Interactive quizzes to test your financial knowledge are on the way.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;

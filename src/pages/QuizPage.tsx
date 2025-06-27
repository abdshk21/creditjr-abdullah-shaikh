
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#102c54] flex items-center justify-center gap-3">
              <Brain className="h-8 w-8" />
              Knowledge Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-6">🧠</div>
            <div className="text-xl font-semibold text-gray-700 mb-4">
              Coming Soon!
            </div>
            <div className="text-gray-600 max-w-md mx-auto">
              Test your financial knowledge with interactive quizzes and earn points while learning about money management!
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPage;


import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuizList from '@/components/QuizList';

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
          <h1 className="text-3xl font-bold text-[#102c54] flex items-center gap-3">
            <Brain className="h-8 w-8" />
            Knowledge Quiz
          </h1>
        </div>

        {/* Quiz List */}
        <QuizList />
      </div>
    </div>
  );
};

export default QuizPage;

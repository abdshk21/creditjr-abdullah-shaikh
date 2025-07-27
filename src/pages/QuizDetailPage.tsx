import { useParams } from 'react-router-dom';
import QuizInterface from '@/components/QuizInterface';

const QuizDetailPage = () => {
  const { quizId } = useParams();

  if (!quizId) {
    return (
      <div className="min-h-screen bg-white p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-red-500">
            Quiz ID not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <QuizInterface quizId={quizId} />
      </div>
    </div>
  );
};

export default QuizDetailPage;
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const QuizList = () => {
  const navigate = useNavigate();

  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      try {
        // Use direct SQL query to bypass TypeScript issues
        const { data, error } = await (supabase as any).from('quizzes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as Quiz[];
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-lg border-0">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center p-8">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error loading quizzes
          </div>
          <p className="text-gray-600">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center p-8">
          <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <div className="text-xl font-semibold text-gray-700 mb-2">
            No quizzes available
          </div>
          <p className="text-gray-600">Check back later for new quizzes!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-[#102c54] flex items-center gap-3">
              <Brain className="h-6 w-6" />
              {quiz.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {quiz.description}
            </p>
            <Button 
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="bg-[#102c54] hover:bg-[#102c54]/90 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizList;
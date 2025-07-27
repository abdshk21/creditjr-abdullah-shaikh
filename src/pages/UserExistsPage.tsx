import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const UserExistsPage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/lovable-uploads/d0d73a79-f67b-4982-b5bf-afdf95d6b8b9.png')`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'top left'
      }}
    >
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="text-4xl mb-4">👤</div>
            <CardTitle className="text-xl text-[#102c54]">
              User Already Exists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-6">
                An account with this email address already exists. Please log in to continue.
              </p>
            </div>
            
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-[#d8a434] hover:bg-[#c19530] text-[#102c54] font-semibold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              Login Instead
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate('/auth')}
                className="text-sm text-[#d8a434] hover:text-[#c19530] font-medium underline"
              >
                Back to Authentication
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserExistsPage;
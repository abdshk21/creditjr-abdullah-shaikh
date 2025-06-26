
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingAddButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/add-transaction')}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white shadow-lg z-50"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingAddButton;

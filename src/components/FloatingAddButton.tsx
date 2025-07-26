
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FloatingAddButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => navigate('/add-transaction')}
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-[#d8a434] hover:bg-[#d8a434]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add transaction</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FloatingAddButton;

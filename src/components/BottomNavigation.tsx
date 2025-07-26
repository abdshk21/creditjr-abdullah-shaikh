
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Target, Award, Lightbulb, BookOpen, Brain, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/'
    },
    {
      id: 'goal',
      label: 'Goal',
      icon: Target,
      path: '/set-goal'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      path: '/transaction-history'
    },
    {
      id: 'score',
      label: 'Score',
      icon: Award,
      path: '/my-score'
    },
    {
      id: 'blogs',
      label: 'Blogs',
      icon: BookOpen,
      path: '/blogs'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Brain,
      path: '/quiz'
    },
    {
      id: 'recommendations',
      label: 'Tips',
      icon: Lightbulb,
      path: '/recommendations'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: MessageSquare,
      path: '/contact'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 px-2 max-w-screen-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[50px]",
                isActive 
                  ? "bg-[#102c54] text-white shadow-md" 
                  : "text-gray-500 hover:text-[#102c54] hover:bg-gray-50"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                isActive ? "text-white" : "text-current"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-white" : "text-current"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;

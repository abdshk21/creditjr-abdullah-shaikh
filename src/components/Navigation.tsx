
import { useState } from 'react';
import { Home, Plus, Target, TrendingUp, Brain, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Add Expense', icon: Plus },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'credit', label: 'Credit Score', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">FinanceTracker</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-white/20"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 to-purple-600 text-white transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 hidden lg:block">FinanceTracker</h1>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-white/20 text-white'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navigation;

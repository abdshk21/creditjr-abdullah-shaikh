
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import Goals from '@/components/Goals';
import CreditScore from '@/components/CreditScore';
import AIInsights from '@/components/AIInsights';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([
    // Sample data to demonstrate features
    {
      id: '1',
      amount: 12.50,
      category: 'Food & Dining',
      description: 'Lunch at school cafeteria',
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: '2',
      amount: 25.00,
      category: 'Entertainment',
      description: 'Movie tickets',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
    }
  ]);
  const [monthlyBudget, setMonthlyBudget] = useState(500);

  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
  };

  const handleUpdateBudget = (budget: number) => {
    setMonthlyBudget(budget);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard expenses={expenses} monthlyBudget={monthlyBudget} />;
      case 'expenses':
        return <ExpenseForm onAddExpense={handleAddExpense} expenses={expenses} />;
      case 'goals':
        return <Goals expenses={expenses} monthlyBudget={monthlyBudget} onUpdateBudget={handleUpdateBudget} />;
      case 'credit':
        return <CreditScore expenses={expenses} monthlyBudget={monthlyBudget} />;
      case 'insights':
        return <AIInsights expenses={expenses} monthlyBudget={monthlyBudget} />;
      default:
        return <Dashboard expenses={expenses} monthlyBudget={monthlyBudget} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex w-full">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="flex-1 lg:ml-64">
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                {currentPage === 'expenses' ? 'Add Expense' : 
                 currentPage === 'insights' ? 'AI Insights' :
                 currentPage === 'credit' ? 'Credit Score' :
                 currentPage}
              </h2>
              <p className="text-gray-600 mt-2">
                {currentPage === 'dashboard' && 'Welcome back! Here\'s your financial overview.'}
                {currentPage === 'expenses' && 'Log your spending to keep track of your budget.'}
                {currentPage === 'goals' && 'Set and track your monthly financial goals.'}
                {currentPage === 'credit' && 'Monitor your virtual credit score and learn about credit.'}
                {currentPage === 'insights' && 'Get personalized insights about your spending habits.'}
              </p>
            </div>
            
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

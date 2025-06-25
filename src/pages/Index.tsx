
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Plus } from 'lucide-react';
import AddTransaction from '@/components/AddTransaction';
import RecentTransactions from '@/components/RecentTransactions';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  wallet: string;
  type: 'inflow' | 'outflow';
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'add'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      amount: 50,
      category: 'Sports',
      note: 'Football equipment',
      date: '2024-01-15',
      wallet: 'Orange Wallet',
      type: 'outflow'
    },
    {
      id: '2',
      amount: 25,
      category: 'Food',
      note: 'Lunch with friends',
      date: '2024-01-14',
      wallet: 'Orange Wallet',
      type: 'outflow'
    },
    {
      id: '3',
      amount: 100,
      category: 'Payday',
      note: 'Weekly allowance',
      date: '2024-01-13',
      wallet: 'Orange Wallet',
      type: 'inflow'
    }
  ]);

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setCurrentScreen('dashboard');
  };

  const totalInflows = transactions
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflows = transactions
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);

  const walletBalance = totalInflows - totalOutflows;

  if (currentScreen === 'add') {
    return <AddTransaction onSave={handleAddTransaction} onCancel={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="p-4 pb-24">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Abdullah</h1>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-orange-400 to-orange-500 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Orange Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletBalance} د.إ</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-300 to-purple-400 text-white border-0 shadow-md opacity-75">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Debit Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">••••</div>
            </CardContent>
          </Card>
        </div>

        {/* Inflows and Outflows */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Inflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">+{totalInflows} د.إ</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-400 to-red-500 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Outflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">-{totalOutflows} د.إ</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={transactions} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 text-blue-600"
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            onClick={() => setCurrentScreen('add')}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="icon"
          >
            <Plus size={24} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

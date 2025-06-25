
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Gamepad2, UtensilsCrossed, DollarSign } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  wallet: string;
  type: 'inflow' | 'outflow';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sports':
        return <Gamepad2 className="h-5 w-5" />;
      case 'Food':
        return <UtensilsCrossed className="h-5 w-5" />;
      case 'Electronic':
        return <ShoppingBag className="h-5 w-5" />;
      case 'Payday':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
      
      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <Card key={transaction.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'inflow' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.category}</div>
                    <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                    {transaction.note && (
                      <div className="text-xs text-gray-400 mt-1">{transaction.note}</div>
                    )}
                  </div>
                </div>
                
                <div className={`font-bold text-lg ${
                  transaction.type === 'inflow' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.type === 'inflow' ? '+' : '-'}{transaction.amount} د.إ
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {transactions.length === 0 && (
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">No transactions yet. Start by adding your first transaction!</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;

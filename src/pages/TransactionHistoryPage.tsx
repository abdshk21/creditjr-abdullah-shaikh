import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, UtensilsCrossed, Car, BookOpen, Gamepad2, Gift, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string;
  description: string | null;
  date: string;
  affects_score: boolean;
  created_at: string;
}

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'Food', label: 'Food', icon: UtensilsCrossed },
    { value: 'Transport', label: 'Transport', icon: Car },
    { value: 'Education', label: 'Education', icon: BookOpen },
    { value: 'Entertainment', label: 'Entertainment', icon: Gamepad2 },
    { value: 'Gifts', label: 'Gifts', icon: Gift },
    { value: 'Misc', label: 'Misc', icon: DollarSign }
  ];

  const getCategoryIcon = (categoryValue: string) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category?.icon || DollarSign;
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-[#102c54] hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-[#102c54]">Transaction History</h1>
          </div>
          <div className="text-center text-gray-500">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-[#102c54] hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-[#102c54]">Transaction History</h1>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 text-lg">No transactions found</div>
                <div className="text-gray-400 text-sm mt-2">Start by adding your first transaction!</div>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => {
              const CategoryIcon = getCategoryIcon(transaction.category);
              const isIncome = transaction.type === 'income';
              
              return (
                <Card key={transaction.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left side - Icon, Category, Date, Description */}
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          isIncome ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <CategoryIcon className={`h-6 w-6 ${
                            isIncome ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-lg text-[#102c54]">
                              {transaction.category}
                            </span>
                            <Badge 
                              variant={isIncome ? "default" : "destructive"}
                              className={`text-xs font-medium ${
                                isIncome 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                  : 'bg-red-100 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {isIncome ? (
                                <><TrendingUp className="h-3 w-3 mr-1" /> Income</>
                              ) : (
                                <><TrendingDown className="h-3 w-3 mr-1" /> Expense</>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-1">
                            {formatDate(transaction.date)}
                          </div>
                          
                          {transaction.description && (
                            <div className="text-sm text-gray-600 italic">
                              "{transaction.description}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Amount and Score Impact */}
                      <div className="text-right">
                        <div className={`text-2xl font-bold mb-2 ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}د.إ {Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        
                        <div className="flex items-center justify-end gap-1">
                          {transaction.affects_score ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-[#d8a434]" />
                              <span className="text-xs text-[#d8a434] font-medium">Affects Score</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-400 font-medium">No Score Impact</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        {transactions.length > 0 && (
          <Card className="shadow-lg border-0 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Total Transactions</div>
                <div className="text-2xl font-bold text-[#102c54]">{transactions.length}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;

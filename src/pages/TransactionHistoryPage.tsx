import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, TrendingUp, TrendingDown, UtensilsCrossed, Car, BookOpen, Gamepad2, Gift, DollarSign, AlertTriangle, CheckCircle, CalendarIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import FloatingAddButton from '@/components/FloatingAddButton';

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
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [showCalendar, setShowCalendar] = useState(false);

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

  useEffect(() => {
    applyFilters();
  }, [transactions, filter, dateFilter, customDateRange]);

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

  const applyFilters = () => {
    let filtered = transactions;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filter);
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const dayStart = startOfDay(now);
      const dayEnd = endOfDay(now);
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start: dayStart, end: dayEnd });
      });
    } else if (dateFilter === 'this-week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start: weekStart, end: weekEnd });
      });
    } else if (dateFilter === 'this-month') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });
    } else if (dateFilter === 'this-year') {
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start: yearStart, end: yearEnd });
      });
    } else if (dateFilter === 'custom' && customDateRange.from && customDateRange.to) {
      filtered = filtered.filter(transaction => {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { 
          start: customDateRange.from!, 
          end: customDateRange.to! 
        });
      });
    }

    setFilteredTransactions(filtered);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped = transactions.reduce((groups, transaction) => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  const resetFilters = () => {
    setFilter('all');
    setDateFilter('all');
    setCustomDateRange({ from: undefined, to: undefined });
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

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

        {/* Filters */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Date Range Selector */}
              {dateFilter === 'custom' && (
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[280px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange.from ? (
                          customDateRange.to ? (
                            <>
                              {format(customDateRange.from, "LLL dd, y")} -{" "}
                              {format(customDateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(customDateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={customDateRange.from}
                        selected={{
                          from: customDateRange.from,
                          to: customDateRange.to,
                        }}
                        onSelect={(range) => {
                          setCustomDateRange({
                            from: range?.from,
                            to: range?.to,
                          });
                          if (range?.from && range?.to) {
                            setShowCalendar(false);
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  {(customDateRange.from || customDateRange.to) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomDateRange({ from: undefined, to: undefined })}
                      className="px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Reset Filters Button */}
              {(filter !== 'all' || dateFilter !== 'all' || customDateRange.from || customDateRange.to) && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Groups */}
        <div className="space-y-6">
          {groupedTransactions.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 text-lg">
                  {filter === 'all' && dateFilter === 'all' ? 'No transactions found' : 'No transactions match your filters'}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {filter === 'all' && dateFilter === 'all' ? 'Start by adding your first transaction!' : 'Try adjusting your filters or add some transactions.'}
                </div>
              </CardContent>
            </Card>
          ) : (
            groupedTransactions.map(([date, dayTransactions]) => (
              <div key={date} className="space-y-3">
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
                  <h3 className="text-lg font-semibold text-[#102c54] border-b border-gray-200 pb-2">
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {dayTransactions.map((transaction) => {
                    const CategoryIcon = getCategoryIcon(transaction.category);
                    const isIncome = transaction.type === 'income';
                    const hasNegativeScoreImpact = transaction.type === 'expense' && transaction.affects_score;
                    
                    return (
                      <Card key={transaction.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            {/* Left side - Icon, Category, Description */}
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
                                {hasNegativeScoreImpact ? (
                                  <>
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span className="text-xs text-orange-500 font-medium">Affects Score</span>
                                  </>
                                ) : isIncome ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-green-500 font-medium">Positive Impact</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-400 font-medium">No Score Impact</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <Card className="shadow-lg border-0 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  Total Transactions ({filter !== 'all' ? filter : 'all types'}, {
                    dateFilter === 'today' ? 'today' :
                    dateFilter === 'this-week' ? 'this week' :
                    dateFilter === 'this-month' ? 'this month' :
                    dateFilter === 'this-year' ? 'this year' :
                    dateFilter === 'custom' && customDateRange.from && customDateRange.to ? 
                      `${format(customDateRange.from, 'MMM dd')} - ${format(customDateRange.to, 'MMM dd')}` :
                    'all time'
                  })
                </div>
                <div className="text-2xl font-bold text-[#102c54]">{filteredTransactions.length}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Add Button */}
        <FloatingAddButton />
      </div>
    </div>
  );
};

export default TransactionHistoryPage;

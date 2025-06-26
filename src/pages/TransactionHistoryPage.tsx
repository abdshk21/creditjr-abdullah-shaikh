import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarIcon, Search, Filter, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import FloatingAddButton from '@/components/FloatingAddButton';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const { data: transactions, isLoading, error } = useQuery(
    ['transactions', user?.id, searchTerm, categoryFilter, dateFilter],
    async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      if (dateFilter) {
        const formattedDate = format(dateFilter, 'yyyy-MM-dd');
        query = query.eq('date', formattedDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data;
    }
  );

  const allCategories = [...new Set(transactions?.map(t => t.category).filter(Boolean))];

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = searchTerm
      ? transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = categoryFilter ? transaction.category === categoryFilter : true;

    const matchesDate = dateFilter
      ? format(parseISO(transaction.date), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd')
      : true;

    return matchesSearch && matchesCategory && matchesDate;
  }) || [];

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
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
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="col-span-1">
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 focus:border-[#d8a434]"
                />
              </div>

              {/* Category Filter */}
              <div className="col-span-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="border-2 focus:border-[#d8a434]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2">
                    <SelectItem value="">All Categories</SelectItem>
                    {allCategories?.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="col-span-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-2 hover:border-[#d8a434]",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-2" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#102c54] text-white rounded-t-lg">
            <CardTitle className="text-xl">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && <div className="text-center">Loading transactions...</div>}
            {error && <div className="text-center text-red-500">Error: {error.message}</div>}
            {!isLoading && !error && filteredTransactions.length === 0 && (
              <div className="text-center">No transactions found.</div>
            )}
            {!isLoading && !error && filteredTransactions.length > 0 && (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-md shadow-sm border border-gray-200"
                  >
                    <div>
                      <div className="font-semibold">{transaction.description || 'No description'}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.category} - {format(parseISO(transaction.date), 'PPP')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={transaction.type === 'income' ? 'outline' : 'destructive'}
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                      <span className={cn(
                          "font-bold",
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}>
                        {transaction.type === 'income' ? '+' : '-'}د.إ{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex justify-between font-bold">
                  <div>
                    <p>Total Income: <span className="text-green-600">+د.إ{totalIncome.toFixed(2)}</span></p>
                    <p>Total Expenses: <span className="text-red-600">-د.إ{totalExpenses.toFixed(2)}</span></p>
                  </div>
                  <div>
                    Net Balance: د.إ{(totalIncome - totalExpenses).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <FloatingAddButton />
    </div>
  );
};

export default TransactionHistoryPage;

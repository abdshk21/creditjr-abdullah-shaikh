
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

interface Goal {
  monthly_saving_goal: number;
  income_expectation: number;
}

interface CreditScoreData {
  score: number;
}

const LovableClaudeChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I'm your finance coach. Ask me anything about spending, saving, or your credit score — I've got your back 💬",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Fetch user's financial data for context
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) return [];
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  const { data: goals } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) return null;
      return data as Goal;
    },
    enabled: !!user?.id,
  });

  const { data: creditScore } = useQuery({
    queryKey: ['creditScore', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('credit_score')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) return null;
      return data as CreditScoreData;
    },
    enabled: !!user?.id,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserContext = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown: { [key: string]: number } = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      });

    return {
      monthlyAllowance: goals?.income_expectation || totalIncome || 0,
      totalSpent,
      savingsGoal: goals?.monthly_saving_goal || 0,
      actualSavings: totalIncome - totalSpent,
      categoryBreakdown,
      currentScore: creditScore?.score || 650,
      transactionCount: transactions.length
    };
  };

  const generateMockResponse = (userInput: string, context: any) => {
    const responses = [
      `Looking at your spending of د.إ${context.totalSpent} this month, you're doing pretty well! ✅ Have you thought about setting aside د.إ50 each week for your emergency fund?`,
      `Your credit score of ${context.currentScore} shows you're building good habits! 💡 Keep logging your transactions consistently - it really helps with awareness.`,
      `Nice work earning د.إ${context.monthlyAllowance} this month! 💰 What's your biggest spending category right now?`,
      `I see you've logged ${context.transactionCount} transactions total. That's great tracking! What financial goal would you like to focus on this week?`,
      `Your savings progress looks solid! You're at د.إ${context.actualSavings} saved so far. Small consistent steps make the biggest difference! 🎯`
    ];
    
    // Simple keyword matching for more relevant responses
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('score') || lowerInput.includes('credit')) {
      return `Your current score of ${context.currentScore} is looking good! Credit scores improve with consistent spending habits and meeting your savings goals. Keep it up! ✅`;
    }
    if (lowerInput.includes('save') || lowerInput.includes('saving')) {
      return `You're currently saving د.إ${context.actualSavings} towards your goal of د.إ${context.savingsGoal}. ${context.actualSavings >= context.savingsGoal ? 'Amazing! You hit your target! 🎉' : 'You can do this - maybe try the 50/30/20 rule?'} 💡`;
    }
    if (lowerInput.includes('spend') || lowerInput.includes('money')) {
      return `You've spent د.إ${context.totalSpent} this month. ${context.totalSpent > context.monthlyAllowance * 0.8 ? 'Getting close to your limit - maybe review your biggest categories?' : 'Nice control on your spending!'} 💰`;
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const userContext = getUserContext();
      
      // For now, using mock responses that are contextually aware
      // This will be replaced with Lovable's built-in Claude when available
      const mockResponse = generateMockResponse(currentInput, userContext);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Try again in a moment! 🤖",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="shadow-lg border-0 h-[600px] flex flex-col hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-3">
          <MessageCircle className="h-6 w-6" />
          Talk to Your Finance Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d8a434] to-[#f4c430] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#102c54] to-[#1e3a72] text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#102c54] to-[#1e3a72] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#d8a434] to-[#f4c430] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 p-3 rounded-lg">
                <p className="text-sm">Thinking... 🤔</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your finances..."
              className="flex-1 min-h-[40px] max-h-[100px] resize-none border-2 focus:border-[#d8a434]"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-[#d8a434] to-[#f4c430] hover:from-[#e6b345] hover:to-[#f8d147] text-white self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LovableClaudeChat;

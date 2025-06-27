
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import AddTransactionPage from "@/pages/AddTransactionPage";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import SetGoalPage from "@/pages/SetGoalPage";
import MyScorePage from "@/pages/MyScorePage";
import MyAccountPage from "@/pages/MyAccountPage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import LearnPage from "@/pages/LearnPage";
import QuizPage from "@/pages/QuizPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/add-transaction" element={
              <ProtectedRoute>
                <AddTransactionPage />
              </ProtectedRoute>
            } />
            <Route path="/transaction-history" element={
              <ProtectedRoute>
                <TransactionHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/set-goal" element={
              <ProtectedRoute>
                <SetGoalPage />
              </ProtectedRoute>
            } />
            <Route path="/my-score" element={
              <ProtectedRoute>
                <MyScorePage />
              </ProtectedRoute>
            } />
            <Route path="/my-account" element={
              <ProtectedRoute>
                <MyAccountPage />
              </ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            } />
            <Route path="/learn" element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            } />
            <Route path="/quiz" element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

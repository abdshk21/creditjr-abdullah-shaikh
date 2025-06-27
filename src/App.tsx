
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
import FinBuddy from "@/components/FinBuddy";
import Dashboard from "./pages/Dashboard";
import AddTransactionPage from "./pages/AddTransactionPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import SetGoalPage from "./pages/SetGoalPage";
import MyScorePage from "./pages/MyScorePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import LearnPage from "./pages/LearnPage";
import QuizPage from "./pages/QuizPage";
import MyAccountPage from "./pages/MyAccountPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/add-transaction" element={
                <ProtectedRoute>
                  <AddTransactionPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/transaction-history" element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/set-goal" element={
                <ProtectedRoute>
                  <SetGoalPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/my-score" element={
                <ProtectedRoute>
                  <MyScorePage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <RecommendationsPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <LearnPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/quiz" element={
                <ProtectedRoute>
                  <QuizPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              <Route path="/my-account" element={
                <ProtectedRoute>
                  <MyAccountPage />
                  <BottomNavigation />
                  <FinBuddy />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

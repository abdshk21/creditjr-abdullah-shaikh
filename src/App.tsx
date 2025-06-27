import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNavigation from "@/components/BottomNavigation";
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
import FinCharacter from "@/components/FinCharacter";

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
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/add-transaction" element={
                <ProtectedRoute>
                  <AddTransactionPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/transaction-history" element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/set-goal" element={
                <ProtectedRoute>
                  <SetGoalPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/my-score" element={
                <ProtectedRoute>
                  <MyScorePage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <RecommendationsPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/learn" element={
                <ProtectedRoute>
                  <LearnPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/quiz" element={
                <ProtectedRoute>
                  <QuizPage />
                  <BottomNavigation />
                  <FinCharacter />
                </ProtectedRoute>
              } />
              <Route path="/my-account" element={
                <ProtectedRoute>
                  <MyAccountPage />
                  <BottomNavigation />
                  <FinCharacter />
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

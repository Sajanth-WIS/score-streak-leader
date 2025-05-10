
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StaffPerformance from "./pages/admin/StaffPerformance";
import KpiRules from "./pages/admin/KpiRules";
import StaffList from "./pages/admin/StaffList";
import MyPerformance from "./pages/staff/MyPerformance";
import Leaderboard from "./pages/Leaderboard";
import SaTracker from "./pages/SaTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/sa-tracker" element={<SaTracker />} />
              
              {/* Admin Routes */}
              <Route path="/staff-performance" element={<StaffPerformance />} />
              <Route path="/kpi-rules" element={<KpiRules />} />
              <Route path="/staff-list" element={<StaffList />} />
              
              {/* Staff Routes */}
              <Route path="/my-performance" element={<MyPerformance />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

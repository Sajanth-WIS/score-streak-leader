import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TeamProvider } from "./contexts/TeamContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import KpiRules from "./pages/admin/KpiRules";
import StaffList from "./pages/admin/StaffList";
import DataManagement from "./pages/admin/DataManagement";
import Settings from "./pages/admin/Settings";
import BonusCalculator from "./pages/admin/BonusCalculator";
import BonusHistory from "./pages/admin/BonusHistory";
import Leaderboard from "./pages/Leaderboard";
import SaTracker from "./pages/SaTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminProvider>
      <SettingsProvider>
        <TeamProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/sa-tracker" element={<SaTracker />} />
                  <Route path="/bonus-calculator" element={<BonusCalculator />} />
                  <Route path="/bonus-history" element={<BonusHistory />} />
                  <Route path="/kpi-rules" element={<KpiRules />} />
                  <Route path="/staff-list" element={<StaffList />} />
                  <Route path="/data-management" element={<DataManagement />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TeamProvider>
      </SettingsProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;

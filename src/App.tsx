import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/Login.tsx";
import RegisterPage from "./pages/Register.tsx";
import DashboardPage from "./pages/Dashboard.tsx";
import AdminPage from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import NotificationPreferencesPage from "./pages/NotificationPreferences.tsx";
import UnsubscribePage from "./pages/Unsubscribe.tsx";
import EmailUnsubscribePage from "./pages/EmailUnsubscribe.tsx";
import ForgotPasswordPage from "./pages/ForgotPassword.tsx";
import ResetPasswordPage from "./pages/ResetPassword.tsx";
import ProfilePage from "./pages/Profile.tsx";
import DirectoryPage from "./pages/Directory.tsx";
import EventsPage from "./pages/Events.tsx";
import ESGReportPage from "./pages/ESGReport.tsx";
import LionApplicationPage from "./pages/LionApplication.tsx";
import LionsPage from "./pages/Lions.tsx";
import ReferralRewardsPage from "./pages/ReferralRewards.tsx";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireSuperAdmin } from "@/components/RequireSuperAdmin";
import { RequireAuth } from "@/components/RequireAuth";
import { ReferralSideRibbon } from "@/components/ReferralSideRibbon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <ReferralSideRibbon />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/settings/notifications" element={<RequireAuth><NotificationPreferencesPage /></RequireAuth>} />
          <Route path="/settings/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/directory" element={<RequireAuth><DirectoryPage /></RequireAuth>} />
          <Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
          <Route path="/esg" element={<RequireAuth><ESGReportPage /></RequireAuth>} />
          <Route path="/lions" element={<LionsPage />} />
          <Route path="/lions/apply" element={<RequireAuth><LionApplicationPage /></RequireAuth>} />
          <Route path="/referral-rewards" element={<ReferralRewardsPage />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          <Route path="/email-unsubscribe" element={<EmailUnsubscribePage />} />
          <Route path="/admin" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/members" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/approvals" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/communications" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/bulk-actions" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/events" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/checkin" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/esg" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/lions" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/intros" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/audit" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/settings" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

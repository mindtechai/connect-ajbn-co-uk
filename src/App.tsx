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
import { AuthProvider } from "@/hooks/useAuth";
import { RequireSuperAdmin } from "@/components/RequireSuperAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/members" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/approvals" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/communications" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/bulk-actions" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="/admin/settings" element={<RequireSuperAdmin><AdminPage /></RequireSuperAdmin>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

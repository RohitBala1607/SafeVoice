import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ComplaintProvider } from "./context/ComplaintContext";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import PermissionOnboarding from "./pages/PermissionOnboarding";
import RoleSelection from "./pages/RoleSelection";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import SafetySettings from "./pages/SafetySettings";
import FileComplaint from "./pages/FileComplaint";
import TrackCases from "./pages/TrackCases";
import AuthorityLogin from "./pages/AuthorityLogin";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import InstitutionTransparency from "./pages/InstitutionTransparency";
import InstitutionLogin from "./pages/InstitutionLogin";
import InstitutionRegister from "./pages/InstitutionRegister";
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ComplaintProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/permissions" element={<PermissionOnboarding />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/safety-settings" element={<SafetySettings />} />
            <Route path="/file-complaint" element={<FileComplaint />} />
            <Route path="/cases" element={<TrackCases />} />
            <Route path="/authority-login" element={<AuthorityLogin />} />
            <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
            <Route path="/institution-login" element={<InstitutionLogin />} />
            <Route path="/institution-register" element={<InstitutionRegister />} />
            <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
            <Route path="/institution-transparency" element={<InstitutionTransparency />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/modules" element={<Modules />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ComplaintProvider>
  </QueryClientProvider>
);

export default App;

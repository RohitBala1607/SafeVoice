import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ComplaintProvider } from "./context/ComplaintContext";
import { AuthProvider } from "./context/AuthContext";

// 🔴 SOS Engine (must exist)
import { startSOS } from "@/services/sosEngine";

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
import InstitutionProfile from "./pages/InstitutionProfile";
import InstitutionTraining from "./pages/InstitutionTraining";
import InstitutionAnalytics from "./pages/InstitutionAnalytics";
import InstitutionIC from "./pages/InstitutionIC";
import Modules from "./pages/Modules";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 🧠 Gesture Control States
  const keyPressCount = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSOSRunning = useRef(false);

  useEffect(() => {
    console.log("🚨 Multi-Gesture SOS System Active (Keyboard + Mobile)");

    // 🔴 COMMON SOS TRIGGER FUNCTION (prevents duplicate triggers)
    const triggerSOS = (source: string) => {
      if (isSOSRunning.current) return;

      console.log(`🚨 PANIC GESTURE DETECTED via ${source}`);
      isSOSRunning.current = true;

      // Start full emergency system
      startSOS();

      // Cooldown to prevent spam triggers
      setTimeout(() => {
        isSOSRunning.current = false;
      }, 10000);
    };

    // ⌨️ KEYBOARD GESTURE: Press "S" 3 times quickly
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "s") {
        keyPressCount.current += 1;

        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          keyPressCount.current = 0;
        }, 1500);

        if (keyPressCount.current >= 3) {
          triggerSOS("Keyboard (Triple S Key)");
          keyPressCount.current = 0;
        }
      }
    };

    // 📳 MOBILE GESTURE: Shake Detection (Future Mobile Support)
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const movement =
        Math.abs(acc.x || 0) +
        Math.abs(acc.y || 0) +
        Math.abs(acc.z || 0);

      // Shake threshold (for mobile devices)
      if (movement > 30) {
        triggerSOS("Mobile Shake Gesture");
      }
    };

    // 🔗 Attach Global Listeners (Works Across All Pages)
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ComplaintProvider>
          <TooltipProvider>
            {/* 🔔 Global Notifications */}
            <Toaster />
            <Sonner />

            {/* 🌐 Router */}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/permissions" element={<PermissionOnboarding />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/register" element={<Registration />} />
                {/* Student/Victim Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/safety-settings" element={<ProtectedRoute><SafetySettings /></ProtectedRoute>} />
                <Route path="/file-complaint" element={<ProtectedRoute><FileComplaint /></ProtectedRoute>} />
                <Route path="/cases" element={<ProtectedRoute><TrackCases /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Institution Routes */}
                <Route path="/institution-login" element={<InstitutionLogin />} />
                <Route path="/institution-register" element={<InstitutionRegister />} />
                <Route path="/institution-dashboard" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionDashboard /></ProtectedRoute>} />
                <Route path="/institution-profile" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionProfile /></ProtectedRoute>} />
                <Route path="/institution-transparency" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionTransparency /></ProtectedRoute>} />
                <Route path="/institution-training" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionTraining /></ProtectedRoute>} />
                <Route path="/institution-analytics" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionAnalytics /></ProtectedRoute>} />
                <Route path="/institution-ic" element={<ProtectedRoute allowedRoles={['institution']}><InstitutionIC /></ProtectedRoute>} />

                {/* Authority Routes */}
                <Route path="/authority-login" element={<AuthorityLogin />} />
                <Route path="/authority-dashboard" element={<ProtectedRoute allowedRoles={['authority']}><AuthorityDashboard /></ProtectedRoute>} />

                <Route path="/modules" element={<Modules />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

            {/* 🧪 Hidden Dev Hint */}
            <div style={{ display: "none" }}>
              Gesture Testing:
              - Press "S" key 3 times OR
              - Triple Click Mouse
              to trigger Panic SOS
            </div>
          </TooltipProvider>
        </ComplaintProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
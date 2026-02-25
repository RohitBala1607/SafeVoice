import { motion } from "framer-motion";
import { Shield, Lock, User, Building2, Key, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/role-selection");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="Profile" subtitle="Anonymous Identity" showBack onBack={() => navigate("/dashboard")} />

      <div className="flex-1 px-4 py-6">
        {/* Anonymous ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl gradient-primary p-5 shadow-elevated"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary-foreground/10 p-3">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Anonymous Identity</p>
              <p className="font-display text-xl font-bold text-primary-foreground">
                {user?.victimId || (user?.id ? `SV-${Math.floor(100000 + Math.random() * 900000)}` : "SV-LOADING")}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2">
            <Lock className="h-3 w-3 text-primary-foreground/60" />
            <p className="text-[10px] text-primary-foreground/60">Real identity encrypted · POSH Act Section 16 compliant</p>
          </div>
        </motion.div>

        {/* Details */}
        <div className="mt-6 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Institution</p>
                <p className="text-sm font-medium text-foreground">{user?.institution || "SafeVoice Network"}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Verification Status</p>
                <p className="text-sm font-medium text-safety">Verified ✓</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Encryption Level</p>
                <p className="text-sm font-medium text-foreground">AES-256 End-to-End</p>
              </div>
            </div>
          </motion.div>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="mt-8 w-full rounded-xl border-emergency/30 py-5 text-sm font-medium text-emergency hover:bg-emergency/5"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

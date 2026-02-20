import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";

const AuthorityLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // In a real app, the institution would be linked to the user's account.
    // Defaulting to "Delhi University" for this prototype session.
    localStorage.setItem("authority_institution", "Delhi University");
    navigate("/authority-dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader subtitle="IC Member / Authority Access" showBack onBack={() => navigate("/role-selection")} />

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl bg-primary/10 p-5">
          <Shield className="h-12 w-12 text-primary" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 w-full max-w-sm">
          <h2 className="text-center font-display text-xl font-bold text-foreground">Authority Login (POSH Member)</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">Internal Committee Administration access</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Official Email</label>
              <Input type="email" placeholder="admin@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button
              onClick={handleLogin}
              disabled={!email || !password}
              className="w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Secure Login
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorityLogin;

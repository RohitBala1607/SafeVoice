import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, KeyRound, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Authority Login Successful",
        description: "Access granted to IC Administration.",
      });
      navigate("/authority-dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid authority credentials.",
      });
    } finally {
      setLoading(false);
    }
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
              disabled={!email || !password || loading}
              className="w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              {loading ? "Verifying..." : "Secure Login"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorityLogin;

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const InstitutionLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast({
                title: "Login Successful",
                description: "Welcome to your administration dashboard.",
            });
            navigate("/institution-dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppHeader
                subtitle="Institution Administration"
                showBack
                onBack={() => navigate("/role-selection")}
            />

            <div className="flex flex-1 flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl bg-primary/10 p-5"
                >
                    <Building2 className="h-12 w-12 text-primary" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 w-full max-w-sm"
                >
                    <h2 className="text-center font-display text-xl font-bold text-foreground">Institution Login</h2>
                    <p className="mt-1 text-center text-sm text-muted-foreground">Access your organization's POSH compliance dashboard</p>

                    <form onSubmit={handleLogin} className="mt-8 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-foreground">Official Email</label>
                            <Input
                                type="email"
                                placeholder="admin@institution.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!email || !password || loading}
                            className="w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                            {loading ? "Authenticating..." : "Secure Access"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        New organization?{" "}
                        <Link
                            to="/institution-register"
                            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            Register here <ArrowRight className="h-3 w-3" />
                        </Link>
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 max-w-xs text-center"
                >
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest font-bold">
                        Verified by SafetyNet Pro Compliance Framework
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default InstitutionLogin;

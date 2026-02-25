import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            await login(email, password);
            toast({
                title: "Login Successful",
                description: "Welcome back to your secure dashboard.",
            });
            navigate("/dashboard");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid credentials. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppHeader subtitle="Secure Victim Login" showBack onBack={() => navigate("/role-selection")} />

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm space-y-6"
                >
                    <div className="text-center">
                        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">Access Your Shield</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Continue tracking your safe records and reports.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                type="email"
                                placeholder="Institutional Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10"
                                type="password"
                                placeholder="Secure Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="mt-6 w-full rounded-xl gradient-primary py-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">Login Securely <ArrowRight className="h-4 w-4" /></span>
                            )}
                        </Button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have a secure identity?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="font-bold text-primary hover:underline"
                            >
                                Create SV-ID
                            </button>
                        </p>
                    </div>

                    <div className="mt-8 rounded-xl bg-accent p-4 text-center">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Your identity remains anonymous per POSH Act Section 16. <br />
                            All data is end-to-end encrypted.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

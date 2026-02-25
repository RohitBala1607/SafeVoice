import { motion } from "framer-motion";
import { Building2, Mail, ShieldCheck, HardDrive, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const InstitutionProfile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/role-selection");
    };

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <AppHeader title="Org Profile" subtitle="Administration Details" showBack onBack={() => navigate("/institution-dashboard")} />

            <div className="flex-1 px-4 py-6">
                {/* Org Identity Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl gradient-primary p-5 shadow-elevated"
                >
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary-foreground/10 p-3">
                            <Building2 className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-xs text-primary-foreground/60">Organization Name</p>
                            <p className="font-display text-xl font-bold text-primary-foreground">{user?.institution || "N/A"}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2">
                        <ShieldCheck className="h-3 w-3 text-primary-foreground/60" />
                        <p className="text-[10px] text-primary-foreground/60">Verified Administrator Account • POSH Compliant</p>
                    </div>
                </motion.div>

                {/* Details Section */}
                <h3 className="mt-8 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Organization Info</h3>
                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Admin Email</p>
                                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Org ID / License</p>
                                <p className="text-sm font-medium text-foreground">{(user as any)?.orgId || "ORG-884210"}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action List */}
                <h3 className="mt-8 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Account & Security</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => navigate("/institution-transparency")}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Compliance Settings</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="mt-12 w-full rounded-xl border-emergency/30 py-6 text-sm font-semibold text-emergency hover:bg-emergency/5"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Secure Sign Out
                </Button>
            </div>

            <BottomNav />
        </div>
    );
};

export default InstitutionProfile;

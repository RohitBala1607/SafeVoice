import { motion } from "framer-motion";
import {
    Building2, Users, ShieldCheck, GraduationCap,
    BarChart3, FileCheck, Info, TrendingUp, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";

const InstitutionDashboard = () => {
    const navigate = useNavigate();
    // We can default to a generic name if not found
    const institution = localStorage.getItem("user_institution") || "Delhi University";

    const handleLogout = () => {
        localStorage.removeItem("user_institution");
        navigate("/role-selection");
    };

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <div className="gradient-primary px-4 pb-6 pt-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary-foreground" />
                        <div>
                            <h1 className="font-display text-lg font-bold text-primary-foreground">Institution Portal</h1>
                            <p className="text-xs text-primary-foreground/60">{institution}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>

                {/* High Level Stats */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-primary-foreground/60">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-semibold tracking-wider">Compliance Score</span>
                        </div>
                        <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">92%</p>
                        <div className="mt-2 h-1 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                            <div className="h-full bg-safety w-[92%]" />
                        </div>
                    </div>
                    <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-primary-foreground/60">
                            <Users className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-semibold tracking-wider">Staff Trained</span>
                        </div>
                        <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">845</p>
                        <p className="text-[10px] text-safety font-medium leading-none mt-1">✓ 88% complete</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 py-6">
                {/* Compliance Alert */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 rounded-xl border border-safety/30 bg-safety/5 p-4 flex items-start gap-3"
                >
                    <div className="mt-0.5 rounded-full bg-safety/20 p-1.5">
                        <ShieldCheck className="h-4 w-4 text-safety" />
                    </div>
                    <div>
                        <h4 className="font-display text-sm font-bold text-foreground">Annual Report Ready</h4>
                        <p className="mt-1 text-xs text-muted-foreground">Your 2025-26 POSH Annual Compliance Report has been generated and is ready for submission.</p>
                    </div>
                </motion.div>

                {/* Administration Links */}
                <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organizational Control</h3>
                <div className="grid grid-cols-2 gap-3">
                    <DashboardCard
                        icon={GraduationCap}
                        title="Training Portal"
                        description="Manage mandatory staff POSH sessions"
                        variant="shield"
                        onClick={() => { }}
                    />
                    <DashboardCard
                        icon={BarChart3}
                        title="Analytics"
                        description="Institutional sentiment & trends"
                        onClick={() => { }}
                    />
                    <DashboardCard
                        icon={FileCheck}
                        title="IC Committee"
                        description="Manage Internal Committee members"
                        onClick={() => { }}
                    />
                    <DashboardCard
                        icon={TrendingUp}
                        title="Transparency"
                        description="View your public safety score"
                        variant="safety"
                        onClick={() => navigate("/institution-transparency")}
                    />
                </div>

                {/* Information Grid */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Case Overview (Aggregated)</h3>
                        <button className="text-[10px] text-primary font-bold uppercase hover:underline">Full Details</button>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-safety" />
                                <span className="text-xs font-medium text-foreground">Resolved Successfully</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">24</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-warning" />
                                <span className="text-xs font-medium text-foreground">Under IC Review</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">8</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emergency" />
                                <span className="text-xs font-medium text-foreground">Escalated / External</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">2</span>
                        </div>
                    </div>

                    <div className="rounded-xl bg-muted/50 p-4 flex gap-3">
                        <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                            Per POSH Act Section 16, individual victim and respondent identities are not visible in the Institutional Dashboard. Only the Internal Committee has access to specific case details.
                        </p>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default InstitutionDashboard;

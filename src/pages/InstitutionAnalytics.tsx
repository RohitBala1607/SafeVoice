import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, ShieldAlert, PieChart, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const InstitutionAnalytics = () => {
    const navigate = useNavigate();

    const metrics = [
        { label: "Institutional Sentiment", value: "8.4/10", change: "+12%", trend: "up" },
        { label: "Avg Resolution Time", value: "14 Days", change: "-2.1d", trend: "up" },
        { label: "Anonymous Reports", value: "92%", change: "+5%", trend: "up" },
        { label: "Resolution Rate", value: "98.2%", change: "+0.4%", trend: "up" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <AppHeader
                title="Impact Analytics"
                subtitle="Safety & Resolution Metrics"
                showBack
                onBack={() => navigate("/institution-dashboard")}
            />

            <div className="flex-1 px-4 py-6">
                {/* Main Chart Placeholder / High Level Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-2xl border border-border bg-card p-4"
                        >
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter leading-none mb-2">{m.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-xl font-display font-bold text-foreground">{m.value}</p>
                                <span className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-safety' : 'text-emergency'}`}>
                                    {m.change}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Priority Trends */}
                <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category Breakdown</h3>
                <div className="space-y-3">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emergency/10 flex items-center justify-center">
                                    <ShieldAlert className="h-5 w-5 text-emergency" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-foreground">Critical Safety Alerts</p>
                                    <p className="text-[10px] text-muted-foreground">Last 30 days active</p>
                                </div>
                            </div>
                            <span className="text-xl font-display font-extrabold text-emergency">03</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: "POSH Violations", value: 65, color: "bg-primary" },
                                { label: "Harassment", value: 25, color: "bg-warning" },
                                { label: "Physical Safety", value: 10, color: "bg-emergency" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="font-bold text-foreground">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Feed Placeholder */}
                <div className="mt-8 rounded-2xl bg-muted/30 border border-dashed border-border p-6 flex flex-col items-center text-center">
                    <Activity className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <h4 className="font-display text-sm font-bold text-muted-foreground">Real-time Heatmap</h4>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                        Detailed location-based grievance mapping is available in the desktop professional suite.
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default InstitutionAnalytics;

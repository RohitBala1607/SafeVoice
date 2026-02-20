import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck, Users, Calendar, ArrowLeft, Plus, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const InstitutionTraining = () => {
    const navigate = useNavigate();

    const sessions = [
        { title: "Prevention of Sexual Harassment (POSH)", date: "Oct 12, 2025", status: "completed", attendees: 145 },
        { title: "IC Committee - Legal Procedures", date: "Nov 05, 2025", status: "scheduled", attendees: 12 },
        { title: "General Staff Mandatory Training", date: "Jan 20, 2026", status: "open", attendees: 450 },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <AppHeader
                title="Training Portal"
                subtitle="Staff Compliance Education"
                showBack
                onBack={() => navigate("/institution-dashboard")}
            />

            <div className="flex-1 px-4 py-6">
                {/* Training Overview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl border border-border bg-card p-4"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Users className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Staff Certified</span>
                        </div>
                        <p className="text-2xl font-display font-bold text-foreground">84%</p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-safety w-[84%]" />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-2xl border border-border bg-card p-4"
                    >
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Compliance</span>
                        </div>
                        <p className="text-2xl font-display font-bold text-foreground">Tier 1</p>
                        <p className="text-[10px] text-safety font-medium mt-1">✓ Audit Ready</p>
                    </motion.div>
                </div>

                {/* Sessions List */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Training Sessions</h3>
                    <Button variant="ghost" className="h-auto p-0 text-[10px] text-primary font-bold uppercase">
                        <Plus className="mr-1 h-3 w-3" /> Schedule New
                    </Button>
                </div>

                <div className="space-y-3">
                    {sessions.map((session, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl border border-border bg-card p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-display text-sm font-bold text-foreground">{session.title}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                            <Calendar className="h-3 w-3" /> {session.date}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                            <Users className="h-3 w-3" /> {session.attendees} Enrolled
                                        </span>
                                    </div>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${session.status === 'completed' ? 'bg-safety/10 text-safety' :
                                        session.status === 'scheduled' ? 'bg-warning/10 text-warning' :
                                            'bg-primary/10 text-primary'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Certification Card */}
                <div className="mt-8 rounded-2xl gradient-primary p-5 text-primary-foreground">
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-primary-foreground/10 p-3">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-display text-base font-bold">LMS Integration Ready</h4>
                            <p className="mt-1 text-xs text-primary-foreground/70 leading-relaxed">
                                Connect your existing Learning Management System to auto-sync staff completion certificates with SafeVoice.
                            </p>
                            <Button variant="outline" className="mt-4 border-primary-foreground/20 bg-white/5 hover:bg-white/10 text-xs text-primary-foreground">
                                Configure Webhooks
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default InstitutionTraining;

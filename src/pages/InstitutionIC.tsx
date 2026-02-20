import { motion } from "framer-motion";
import { Users, UserPlus, ShieldCheck, Mail, Phone, MoreVertical, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

const InstitutionIC = () => {
    const navigate = useNavigate();

    const members = [
        { name: "Dr. Ananya Sharma", role: "Presiding Officer", email: "a.sharma@du.ac.in", verified: true },
        { name: "Advocate Rajesh Kumar", role: "Legal Expert (External)", email: "kumar.legal@highcourt.in", verified: true },
        { name: "Prof. Meera Deshmukh", role: "Faculty Member", email: "m.deshmukh@du.ac.in", verified: true },
        { name: "Siddharth Verma", role: "Student Representative", email: "sid.v@student.du.ac.in", verified: false },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <AppHeader
                title="IC Committee"
                subtitle="Internal Committee Management"
                showBack
                onBack={() => navigate("/institution-dashboard")}
            />

            <div className="flex-1 px-4 py-6">
                {/* Management Header */}
                <div className="mb-8 rounded-2xl bg-card border border-border p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-display text-base font-bold text-foreground">Active Committee</h3>
                            <p className="text-xs text-muted-foreground">05 Members · Audit Successful</p>
                        </div>
                    </div>
                    <Button size="icon" className="h-10 w-10 rounded-full gradient-primary">
                        <UserPlus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Members List */}
                <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Committee Members</h3>
                <div className="space-y-3">
                    {members.map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-display font-bold text-muted-foreground">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-bold text-foreground">{member.name}</h4>
                                        {member.verified && <ShieldCheck className="h-3 w-3 text-safety" />}
                                    </div>
                                    <p className="text-[10px] text-primary font-medium">{member.role}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{member.email}</p>
                                </div>
                            </div>
                            <button className="p-2 text-muted-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Regulatory Info */}
                <div className="mt-10 rounded-xl bg-orange-50 border border-orange-100 p-4 flex gap-3">
                    <Building2 className="h-5 w-5 text-orange-400 shrink-0" />
                    <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                        Regulatory Alert: Ensure at least one external member is present in the IC per the POSH Act, 2013 requirements. Current committee meets these criteria.
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default InstitutionIC;

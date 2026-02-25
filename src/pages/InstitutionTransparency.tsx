import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Search, ShieldCheck, Clock, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import api from "@/services/api";

const InstitutionTransparency = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/complaints/transparency');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch transparency data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="Institution Reports" subtitle="Transparency Dashboard" showBack onBack={() => navigate("/dashboard")} />

      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search institutions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <p className="mt-4 mb-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
          Only anonymized, aggregated data is displayed
        </p>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading transparency reports...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No reports found for "{search}"</p>
            </div>
          ) : (
            filtered.map((inst, i) => (
              <motion.div
                key={inst.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{inst.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-safety" />
                    <span className="text-xs font-bold text-safety">{Math.round(inst.score)}</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { label: "Total", value: inst.total, icon: BarChart3 },
                    { label: "Reviewing", value: inst.reviewing, icon: Clock },
                    { label: "Resolved", value: inst.resolved, icon: ShieldCheck },
                    { label: "Avg Days", value: inst.avgDays || 12, icon: TrendingUp },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-lg bg-muted/50 px-2 py-2 text-center">
                      <Icon className="mx-auto h-3 w-3 text-muted-foreground" />
                      <p className="mt-1 font-display text-sm font-bold text-foreground">{value}</p>
                      <p className="text-[9px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Safety Score Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Safety Score</span>
                    <span className="font-semibold text-safety">{Math.round(inst.score)}/100</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-safety transition-all duration-500" style={{ width: `${inst.score}%` }} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default InstitutionTransparency;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Filter, Eye, CheckCircle, Clock, AlertTriangle, BarChart3, TrendingUp, Users, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [oversightData, setOversightData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOversight = async () => {
      try {
        const res = await api.get("/authorities/oversight");
        if (res.data.success) {
          setOversightData(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch oversight data:", err);
        toast.error("Failed to load institutional reports Oversight.");
      } finally {
        setLoading(false);
      }
    };
    fetchOversight();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/role-selection");
  };

  const filteredOversight = oversightData.filter(inst =>
    inst.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReports = oversightData.reduce((acc, curr) => acc + curr.totalReports, 0);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="gradient-primary px-4 pb-5 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="font-display text-lg font-bold text-primary-foreground">Global Oversight Portal</h1>
              <p className="text-xs text-primary-foreground/60">POSH IC Central Authority</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full bg-primary-foreground/10 p-2 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Global Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Insitutions", value: oversightData.length.toString(), color: "text-primary-foreground" },
            { label: "Total Cases", value: totalReports.toString(), color: "text-primary-foreground" },
            { label: "Avg Resolution", value: "94%", color: "text-safety-foreground" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-primary-foreground/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-[10px] text-primary-foreground/60">{label}</p>
              <p className={`font-display text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search institutions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Generating Oversight metrics...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOversight.map((inst, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-foreground">{inst.institution}</h3>
                    {inst.priorityStats?.high > 0 && (
                      <span className="flex h-5 items-center rounded-full bg-emergency/10 px-2 text-[10px] font-bold text-emergency">
                        {inst.priorityStats.high} HIGH RISK
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">
                    {inst.totalReports} Reports
                  </span>
                </div>

                {/* Category breakdown */}
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Victim Category Records</p>
                  {inst.categories.map((cat: any, cidx: number) => (
                    <div key={cidx} className="bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-foreground">{cat.type}</span>
                        <span className="text-xs font-bold text-foreground">{cat.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(cat.count / inst.totalReports) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Resolution Rate: {Math.round((inst.totalResolved / inst.totalReports) * 100)}%</span>
                  <Button variant="ghost" className="h-auto p-0 text-primary font-bold">VIEW DETAILED RECORDS</Button>
                </div>
              </motion.div>
            ))}
            {filteredOversight.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <Search className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No institutional records found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;

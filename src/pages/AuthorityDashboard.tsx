import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Filter, Eye, CheckCircle, Clock, AlertTriangle, Mic, MapPin, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SOSAlert from "@/components/SOSAlert";

import { useComplaints } from "@/context/ComplaintContext";

const priorityColors = {
  low: "bg-safety/10 text-safety",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  emergency: "bg-emergency/10 text-emergency animate-pulse-emergency",
};

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { complaints, updateStatus } = useComplaints();
  const [searchTerm, setSearchTerm] = useState("");

  const institution = localStorage.getItem("authority_institution") || "Central Administration";

  const filteredComplaints = complaints.filter(c =>
    c.institution === institution &&
    (c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: filteredComplaints.length,
    active: filteredComplaints.filter(c => c.status !== "closed").length,
    sos: filteredComplaints.filter(c => c.hasSOS).length,
    resolved: filteredComplaints.filter(c => c.status === "closed").length,
  };

  const handleLogout = () => {
    localStorage.removeItem("authority_institution");
    navigate("/role-selection");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <SOSAlert institution={institution} />
      <div className="gradient-primary px-4 pb-5 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="font-display text-lg font-bold text-primary-foreground">IC / Authority Portal</h1>
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

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Total", value: stats.total.toString(), color: "text-primary-foreground" },
            { label: "Active", value: stats.active.toString(), color: "text-primary-foreground" },
            { label: "SOS", value: stats.sos.toString(), color: "text-emergency-foreground" },
            { label: "Resolved", value: stats.resolved.toString(), color: "text-primary-foreground" },
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
            <Input className="pl-9" placeholder="Search cases..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl border bg-card p-4 shadow-card ${c.priority === "emergency" ? "border-emergency/30" : "border-border"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-foreground">{c.id}</span>
                      {c.hasSOS && (
                        <span className="rounded-full bg-emergency px-2 py-0.5 text-[9px] font-bold text-emergency-foreground">SOS</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.institution} · {c.type}</p>
                    <p className="text-xs text-muted-foreground">Victim: {c.victimId} · {c.date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityColors[c.priority as keyof typeof priorityColors]}`}>
                    {c.priority}
                  </span>
                </div>

                {/* AI Severity */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">AI Severity Score</span>
                      <span className={`font-semibold ${c.severity >= 80 ? "text-emergency" : c.severity >= 60 ? "text-warning" : "text-safety"}`}>{c.severity}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${c.severity >= 80 ? "bg-emergency" : c.severity >= 60 ? "bg-warning" : "bg-safety"}`}
                        style={{ width: `${c.severity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Evidence indicators */}
                <div className="mt-3 flex items-center gap-3">
                  {c.hasAudio && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mic className="h-3 w-3" /> Audio
                    </div>
                  )}
                  {c.hasSOS && (
                    <div className="flex items-center gap-1 text-xs text-emergency">
                      <MapPin className="h-3 w-3" /> GPS Log
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => toast.info("Opening case details...")}
                  >
                    <Eye className="mr-1 h-3 w-3" /> Review
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs gradient-primary text-primary-foreground"
                    onClick={() => {
                      updateStatus(c.id, "verified");
                      toast.success("Victim marked as verified");
                    }}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" /> Verify
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No complaints found for this institution.</p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default AuthorityDashboard;

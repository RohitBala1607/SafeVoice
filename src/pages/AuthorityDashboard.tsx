import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Filter, Eye, CheckCircle, Clock, AlertTriangle, BarChart3, TrendingUp, Users, LogOut, Loader2, Building2, Activity, ArrowRight, Bell, Download, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("oversight"); // 'oversight' | 'secure-records'
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [oversightData, setOversightData] = useState<any[]>([]);
  const [secureRecords, setSecureRecords] = useState<any>({});
  const [loadingSecure, setLoadingSecure] = useState(false);
  const [selectedInst, setSelectedInst] = useState<string | null>(null);
  const [instRecords, setInstRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [actionLogInput, setActionLogInput] = useState<Record<string, string>>({});
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [loadingSOS, setLoadingSOS] = useState(false);
  const [sosStats, setSosStats] = useState({ total: 0, active: 0, resolved: 0 });

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

    const fetchSecureRecords = async () => {
      setLoadingSecure(true);
      try {
        // Fetch priority sorted records
        const res = await api.get("/authorities/secure-records");
        if (res.data.success) {
          setSecureRecords(res.data.records);
        }
      } catch (err) {
        console.error("Failed to fetch secure records:", err);
      } finally {
        setLoadingSecure(false);
      }
    };

    const fetchSOSAlerts = async () => {
      setLoadingSOS(true);
      try {
        const res = await api.get("/authorities/sos-alerts");
        if (res.data.success) {
          setSosAlerts(res.data.alerts);
          if (res.data.stats) setSosStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch SOS alerts:", err);
      } finally {
        setLoadingSOS(false);
      }
    };

    fetchOversight();
    fetchSecureRecords();
    fetchSOSAlerts();

    // Auto-refresh SOS alerts every 30 seconds for live monitoring
    const sosInterval = setInterval(fetchSOSAlerts, 30000);
    return () => clearInterval(sosInterval);
  }, []);

  const handleVerify = async (recordId: string, complaintId: string) => {
    try {
      // If recordId starts with 'new_', it's a padding record and we need to pass complaintId
      const isNew = recordId.startsWith('new_');
      const idToUse = isNew ? complaintId : recordId;

      const res = await api.patch(`/authorities/secure-records/${idToUse}/verify`, { complaintId });

      if (res.data.success) {
        toast.success("Report verified successfully");
        // Refresh secure records
        const resRecords = await api.get("/authorities/secure-records");
        if (resRecords.data.success) {
          setSecureRecords(resRecords.data.records);
        }
      }
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error("Failed to verify report");
    }
  };

  const handleUpdateStatus = async (recordId: string, complaintId: string, updates: any) => {
    try {
      const isNew = recordId.startsWith('new_');
      const idToUse = isNew ? complaintId : recordId;

      const res = await api.patch(`/authorities/secure-records/${idToUse}/status`, {
        ...updates,
        complaintId
      });

      if (res.data.success) {
        toast.success("Record updated");
        // Refresh
        const resRecords = await api.get("/authorities/secure-records");
        if (resRecords.data.success) {
          setSecureRecords(resRecords.data.records);
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update status");
    }
  };

  const handleAddAction = async (recordId: string, complaintId: string) => {
    const action = actionLogInput[recordId];
    if (!action) return;

    try {
      const isNew = recordId.startsWith('new_');
      const idToUse = isNew ? complaintId : recordId;

      const res = await api.post(`/authorities/secure-records/${idToUse}/actions`, {
        action,
        complaintId
      });

      if (res.data.success) {
        toast.success("Action logged");
        setActionLogInput(prev => ({ ...prev, [recordId]: "" }));
        // Refresh
        const resRecords = await api.get("/authorities/secure-records");
        if (resRecords.data.success) {
          setSecureRecords(resRecords.data.records);
        }
      }
    } catch (err) {
      console.error("Action log failed:", err);
      toast.error("Failed to log action");
    }
  };

  const handleCloseCase = async (complaintId: string) => {
    if (!complaintId || complaintId.startsWith('new_')) {
      toast.error("Cannot close - complaint not yet saved.");
      return;
    }
    try {
      const res = await api.patch(`/authorities/complaints/${complaintId}/close`, {
        resolutionNote: 'Case resolved and closed by POSH IC Authority.'
      });
      if (res.data.success) {
        toast.success("Case marked as completed. Victim and institution will see updated status.");
        const resRecords = await api.get("/authorities/secure-records");
        if (resRecords.data.success) {
          setSecureRecords(resRecords.data.records);
        }
      }
    } catch (err) {
      console.error("Close case failed:", err);
      toast.error("Failed to close case.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/role-selection");
  };

  const filteredOversight = oversightData.filter(inst =>
    inst.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchInstitutionRecords = async (institutionName: string) => {
    setSelectedInst(institutionName);
    setLoadingRecords(true);
    try {
      const res = await api.get(`/authorities/institution/${encodeURIComponent(institutionName)}/records`);
      if (res.data.success) {
        setInstRecords(res.data.records);
      }
    } catch (err) {
      console.error("Failed to fetch records:", err);
      toast.error("Failed to load detailed records.");
    } finally {
      setLoadingRecords(false);
    }
  };

  const closeDetails = () => {
    setSelectedInst(null);
    setInstRecords([]);
  };

  const handleDownloadFullReport = () => {
    if (!instRecords || instRecords.length === 0) {
      toast.error("No records to download");
      return;
    }

    let reportContent = `SafeVoice Authority Log - ${selectedInst}\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
    reportContent += `Date,Type,Priority,Status,Victim ID,Description,AI Summary\n`;

    instRecords.forEach((c: any) => {
      const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Unknown';
      const type = `"${c.type || ''}"`;
      const priority = c.priority || 'Unknown';
      const status = c.status || 'Unknown';
      const victimId = c.victimId || 'Unknown';
      const desc = `"${(c.description || '').replace(/"/g, '""')}"`;
      const aiSummary = `"${(c.aiAnalysis?.summary || '').replace(/"/g, '""')}"`;

      reportContent += `${date},${type},${priority},${status},${victimId},${desc},${aiSummary}\n`;
    });

    const blob = new Blob([reportContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedInst?.replace(/\s+/g, '_')}_Full_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded report for ${selectedInst}`);
  };

  const handleDownloadSingleCase = (c: any) => {
    // AuthorityRecords nest the actual complaint in 'complaintRef'
    const actualCase = c.complaintRef || c;

    // Sometimes actualCase is just the string ID of the complaint
    const reportId = typeof actualCase === 'string'
      ? actualCase
      : (actualCase._id || actualCase.caseId || actualCase.complaintId || c._id);

    // fallback clean check if it starts with new_ 
    let cleanId = reportId?.startsWith('new_') ? reportId.replace('new_', '') : reportId;

    // 🔥 Prevent literal "undefined" string from being used as a valid ID
    if (String(cleanId).trim() === "undefined" || String(cleanId).trim() === "null") {
      cleanId = c._id?.startsWith('new_') ? c._id.replace('new_', '') : c._id;
    }

    if (cleanId) {
      navigate(`/report/${cleanId}`);
    } else {
      toast.error("Invalid case document format.");
    }
  };

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
            { label: "Active SOS", value: sosStats.active.toString(), color: sosStats.active > 0 ? "text-[#ff6060]" : "text-primary-foreground" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg bg-primary-foreground/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-[10px] text-primary-foreground/60">{label}</p>
              <p className={`font-display text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mt-4">
        <button
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'oversight' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('oversight')}
        >
          Institutional Oversight
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'secure-records' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('secure-records')}
        >
          <Shield className="h-4 w-4" /> Secure Records
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'sos' ? 'border-b-2 border-[#ff0000] text-[#ff0000]' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('sos')}
        >
          <Bell className="h-4 w-4" /> Emergency SOS {sosAlerts.length > 0 && <span className="bg-[#ff0000] text-white text-[10px] px-1.5 rounded-full animate-bounce">{sosAlerts.length}</span>}
        </button>
      </div>

      <div className="flex-1 px-4 py-4">
        {activeTab === 'oversight' ? (
          <>
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
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-primary font-bold hover:bg-transparent"
                        onClick={() => fetchInstitutionRecords(inst.institution)}
                      >
                        VIEW DETAILED RECORDS
                      </Button>
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
          </>
        ) : activeTab === 'secure-records' ? (
          <div className="space-y-8">
            {loadingSecure ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Loading secure records...</p>
              </div>
            ) : Object.keys(secureRecords).length > 0 ? (
              Object.entries(secureRecords).map(([institution, records]: [string, any[]]) => (
                <div key={institution} className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-lg font-bold text-foreground">{institution}</h2>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {records.length} Reports
                    </span>
                  </div>

                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${record.internalPriority === 'CRITICAL' ? 'bg-[#ff0000]' :
                          record.internalPriority === 'HIGH' ? 'bg-emergency' :
                            record.internalPriority === 'MEDIUM' ? 'bg-warning' : 'bg-safety'
                          }`} />

                        <div className="flex justify-between items-start mb-3 pl-2">
                          <div>
                            <div className="flex gap-2 items-center mb-2">
                              <select
                                className={`px-2 py-1 text-[10px] font-bold rounded-full border-none outline-none appearance-none cursor-pointer ${record.internalPriority === 'CRITICAL' ? 'bg-[#ff0000]/10 text-[#ff0000] border-2 border-[#ff0000]/20' :
                                  record.internalPriority === 'HIGH' ? 'bg-emergency/10 text-emergency' :
                                    record.internalPriority === 'MEDIUM' ? 'bg-warning/10 text-amber-500' :
                                      'bg-safety/10 text-safety'
                                  }`}
                                value={record.internalPriority}
                                onChange={(e) => handleUpdateStatus(record._id, record.complaintRef?._id, { internalPriority: e.target.value })}
                              >
                                {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                                  <option key={p} value={p}>{p} PRIORITY</option>
                                ))}
                              </select>
                              {record.investigationStatus === 'VERIFIED' && (
                                <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-safety/20 text-safety flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> VERIFIED
                                </span>
                              )}
                            </div>
                            <h4 className="font-display font-bold text-foreground">{record.complaintRef?.type || 'Unknown Type'}</h4>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-2">
                          {/* Column 1: Report Details */}
                          <div className="space-y-3">
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Complaint Description</p>
                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                                {record.complaintRef?.description || "No description provided."}
                              </p>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CONFIDENTIAL NOTES</p>
                              <textarea
                                className="w-full bg-transparent text-xs text-foreground italic border-none focus:ring-0 resize-none p-0 cursor-text"
                                defaultValue={record.confidentialNotes || 'No notes available.'}
                                onBlur={(e) => handleUpdateStatus(record._id, record.complaintRef?._id, { confidentialNotes: e.target.value })}
                                placeholder="Add private investigation notes..."
                              />
                            </div>
                          </div>

                          {/* Column 2: Risk Analysis & Metrics */}
                          <div className="space-y-3 border-x border-border/50 px-0 lg:px-4">
                            <p className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1 uppercase tracking-wider">
                              <Activity className="h-3 w-3" /> AI RISK ANALYSIS
                            </p>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between bg-background border border-border/40 rounded-xl p-3 shadow-sm relative overflow-hidden group">
                                <div className="z-10">
                                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Emergency Weight</p>
                                  <h5 className={`text-lg font-black uppercase ${record.complaintRef?.priority === 'emergency' ? 'text-[#ff1f1f] animate-pulse' :
                                    record.complaintRef?.priority === 'high' ? 'text-emergency' :
                                      record.complaintRef?.priority === 'low' ? 'text-safety' : 'text-warning'
                                    }`}>
                                    {record.complaintRef?.priority || 'MEDIUM'}
                                  </h5>
                                </div>
                                <div className={`absolute right-0 top-0 h-full w-1 ${record.complaintRef?.priority === 'emergency' ? 'bg-[#ff1f1f]' :
                                  record.complaintRef?.priority === 'high' ? 'bg-emergency' :
                                    record.complaintRef?.priority === 'low' ? 'bg-safety' : 'bg-warning'
                                  }`} />
                                <AlertTriangle className={`h-8 w-8 opacity-10 ${record.complaintRef?.priority === 'emergency' ? 'text-[#ff1f1f]' : 'text-muted-foreground'
                                  }`} />
                              </div>

                              <div className="bg-background border border-border/40 rounded-xl p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">AI Confidence Level</p>
                                  <span className="text-xs font-bold font-mono">{(record.complaintRef?.aiConfidence || 0) * 100}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(record.complaintRef?.aiConfidence || 0) * 100}%` }}
                                    className={`h-full rounded-full ${(record.complaintRef?.aiConfidence || 0) > 0.8 ? 'bg-safety' :
                                      (record.complaintRef?.aiConfidence || 0) > 0.5 ? 'bg-warning' : 'bg-emergency'
                                      }`}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-[8px] text-primary/70 font-bold uppercase">System Recommendation</p>
                                <p className="text-[10px] text-foreground font-medium leading-tight">
                                  {record.complaintRef?.priority === 'emergency' ? "IMMEDIATE INTERVENTION REQUIRED. High trauma indicators detected." :
                                    record.complaintRef?.priority === 'high' ? "Prioritize for review within 24 hours. Serious conduct reported." :
                                      "Standard investigation flow recommended. Monitor for escalation."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Status & Action Logs */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">INVESTIGATION LOG</p>
                            <div className="space-y-3 mb-4">
                              {record.actionsTaken && record.actionsTaken.length > 0 ? (
                                record.actionsTaken.map((action: any, aidx: number) => (
                                  <div key={aidx} className="flex gap-3 relative">
                                    {aidx < record.actionsTaken.length - 1 && (
                                      <div className="absolute left-[7px] top-4 w-[1px] h-full bg-border" />
                                    )}
                                    <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-foreground">{action.action}</p>
                                      <p className="text-[9px] text-muted-foreground">
                                        {action.authorName} • {new Date(action.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No actions logged yet.</p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Input
                                className="h-8 text-xs bg-muted/20 border-border/50"
                                placeholder="Log investigation step..."
                                value={actionLogInput[record._id] || ""}
                                onChange={(e) => setActionLogInput(prev => ({ ...prev, [record._id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddAction(record._id, record.complaintRef?._id)}
                              />
                              <Button
                                size="sm"
                                className="h-8 px-3 text-[10px] font-bold"
                                onClick={() => handleAddAction(record._id, record.complaintRef?._id)}
                              >
                                LOG
                              </Button>
                            </div>
                          </div>

                          {/* Attached Evidence */}
                          {record.complaintRef?.evidence && record.complaintRef.evidence.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1">
                                <Shield className="h-3 w-3" /> ATTACHED EVIDENCE
                              </p>
                              <div className="flex flex-col gap-2">
                                {record.complaintRef.evidence.map((item: any, eidx: number) => (
                                  <div key={eidx} className="w-full">
                                    {item.fileType === 'audio' ? (
                                      <audio controls className="h-8 w-full rounded outline-none" src={item.url}>
                                        Your browser does not support the audio element.
                                      </audio>
                                    ) : item.fileType === 'image' ? (
                                      <div className="relative pt-[56%] w-full rounded-md overflow-hidden bg-black/5">
                                        <img src={item.url} alt="Evidence" className="absolute top-0 left-0 w-full h-full object-contain" />
                                      </div>
                                    ) : item.fileType === 'video' ? (
                                      <video controls className="w-full rounded-md bg-black" src={item.url}>
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : (
                                      <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">View {item.name || 'Attachment'}</a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>Reviewed by: {record.reviewedBy?.name || 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border pl-2 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Victim: <span className="font-mono font-bold text-foreground">{record.complaintRef?.victimId}</span></span>
                            <div className="flex gap-2">
                              {record.investigationStatus === 'PENDING_REVIEW' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] font-bold border-safety text-safety hover:bg-safety hover:text-white"
                                  onClick={() => handleVerify(record._id, record.complaintRef?._id)}
                                >
                                  VERIFY REPORT
                                </Button>
                              )}
                              <select
                                className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-2 py-1 rounded border-none cursor-pointer outline-none appearance-none"
                                value={record.investigationStatus}
                                onChange={(e) => handleUpdateStatus(record._id, record.complaintRef?._id, { investigationStatus: e.target.value })}
                              >
                                {["PENDING_REVIEW", "INVESTIGATING", "VERIFIED", "ACTION_TAKEN", "CLOSED"].map(s => (
                                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {/* Mark as Completed button - only if not already closed */}
                          {record.investigationStatus !== 'CLOSED' && record.complaintRef?.status !== 'closed' && (
                            <Button
                              className="w-full h-9 text-xs font-bold rounded-xl bg-safety text-white hover:bg-safety/90 flex items-center gap-2"
                              onClick={() => handleCloseCase(record.complaintRef?._id?.toString())}
                            >
                              <CheckCircle className="h-4 w-4" /> MARK AS COMPLETED
                            </Button>
                          )}
                          {(record.investigationStatus === 'CLOSED' || record.complaintRef?.status === 'closed') && (
                            <div className="w-full h-9 text-xs font-bold rounded-xl bg-muted flex items-center justify-center gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4" /> CASE CLOSED
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-50">
                <Shield className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No secure records available.</p>
                <p className="text-xs mt-1">Investigations are tracked here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-bold text-[#ff0000] flex items-center gap-2">
                <Bell className="h-6 w-6 animate-pulse" /> Active SOS Alerts
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-[#ff0000]/10 text-[#ff0000] px-3 py-1 rounded-full border border-[#ff0000]/20">
                  Live · Auto-refresh 30s
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-[#ff0000]/30 text-[#ff0000] hover:bg-[#ff0000]/5"
                  onClick={async () => {
                    setLoadingSOS(true);
                    try {
                      const res = await api.get('/authorities/sos-alerts');
                      if (res.data.success) setSosAlerts(res.data.alerts);
                    } catch { toast.error('Failed to refresh SOS'); }
                    finally { setLoadingSOS(false); }
                  }}
                >
                  <Loader2 className={`h-3 w-3 mr-1 ${loadingSOS ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {loadingSOS && sosStats.total === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#ff0000]" />
                <p className="mt-2 text-sm text-muted-foreground">Fetching emergency alerts...</p>
              </div>
            ) : (
              <>
                {/* SOS Overview Stats - always visible */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-2xl border border-[#ff0000]/20 bg-[#ff0000]/5 p-3 text-center">
                    <p className="text-[10px] font-bold text-[#ff0000]/70 uppercase tracking-wider">Active</p>
                    <p className="text-2xl font-black text-[#ff0000] mt-0.5">{sosStats.active}</p>
                    {sosStats.active > 0 && <p className="text-[9px] text-[#ff0000]/60 animate-pulse">● LIVE</p>}
                  </div>
                  <div className="rounded-2xl border border-safety/20 bg-safety/5 p-3 text-center">
                    <p className="text-[10px] font-bold text-safety/70 uppercase tracking-wider">Resolved</p>
                    <p className="text-2xl font-black text-safety mt-0.5">{sosStats.resolved}</p>
                    <p className="text-[9px] text-muted-foreground">All time</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-black text-foreground mt-0.5">{sosStats.total}</p>
                    <p className="text-[9px] text-muted-foreground">Ever triggered</p>
                  </div>
                </div>
              </>
            )}

            {/* Active Alerts or Empty State */}
            {sosAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sosAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#ff0000]/5 border-2 border-[#ff0000]/20 rounded-3xl p-5 relative overflow-hidden group hover:border-[#ff0000]/40 transition-all shadow-lg shadow-[#ff0000]/5"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <div className="h-2 w-2 rounded-full bg-[#ff0000] animate-ping" />
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-[#ff0000] p-3 rounded-2xl shadow-lg shadow-[#ff0000]/20 shrink-0">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[10px] font-black text-[#ff0000] uppercase tracking-tighter">🚨 Emergency Signal</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{new Date(alert.created_at || alert.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground truncate">
                          Victim: {alert.victimId}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" /> {alert.institution}
                        </p>
                      </div>
                    </div>

                    {/* Location info */}
                    {alert.location && (
                      <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-3 border border-[#ff0000]/10 mb-3">
                        <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">📍 Last Known Location</p>
                        <p className="text-xs font-mono text-foreground">
                          {alert.location.lat?.toFixed(5)}, {alert.location.lng?.toFixed(5)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          SOS Session: <span className="font-mono font-bold">{alert.publicId}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {alert.mapsLink ? (
                        <a
                          href={alert.mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
                        >
                          📍 TRACK LIVE
                        </a>
                      ) : (
                        <Button className="flex-1 bg-[#ff0000] hover:bg-[#cc0000] text-white font-bold h-10 rounded-xl text-xs">
                          DISPATCH HELP
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1 border-[#ff0000]/20 hover:bg-[#ff0000]/5 text-[#ff0000] font-bold h-10 rounded-xl text-xs"
                        onClick={async () => {
                          try {
                            await api.post('/sos/resolve', { publicId: alert.publicId });
                            toast.success('SOS resolved');
                            const res = await api.get('/authorities/sos-alerts');
                            if (res.data.success) {
                              setSosAlerts(res.data.alerts);
                              if (res.data.stats) setSosStats(res.data.stats);
                            }
                          } catch { toast.error('Failed to resolve SOS'); }
                        }}
                      >
                        ✓ RESOLVED
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-3xl p-12 text-center opacity-40">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-display text-lg font-bold">No Active Emergencies</h3>
                <p className="text-sm">The system is currently clear of SOS signals.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Records Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            className="flex h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-background sm:h-[80vh] sm:rounded-3xl shadow-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold">{selectedInst}</h2>
                <p className="text-xs text-muted-foreground">Detailed Complaint Records</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFullReport}
                  className="h-8 gap-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                  Download Full Report
                </Button>
                <Button variant="ghost" size="icon" onClick={closeDetails} className="rounded-full h-8 w-8">
                  <span className="sr-only">Close</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingRecords ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Fetching records...</p>
                </div>
              ) : instRecords.length > 0 ? (
                instRecords.map((record) => (
                  <div id={`case-card-${record._id}`} key={record._id} className="rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${record.status === 'closed' ? 'bg-safety' :
                      record.status === 'in-progress' ? 'bg-primary' : 'bg-warning'
                      }`} />

                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">
                          {record.created_at || record.createdAt ? new Date(record.created_at || record.createdAt).toLocaleDateString() : 'Unknown Date'}
                        </p>
                        <h4 className="font-display font-bold text-foreground mt-0.5">{record.type}</h4>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${record.priority === 'emergency' ? 'bg-emergency/10 text-emergency' :
                        record.priority === 'high' ? 'bg-safety/10 text-safety' :
                          record.priority === 'low' ? 'bg-success/10 text-success' :
                            'bg-warning/10 text-amber-500'
                        }`}>
                        {record.priority} PRIORITY
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-2 mt-3">
                      <p className="text-xs text-foreground line-clamp-2">"{record.description}"</p>

                      {record.aiAnalysis && record.aiAnalysis.summary && (
                        <div className="mt-2 bg-primary/5 rounded border border-primary/10 p-2">
                          <p className="text-[10px] font-bold text-primary mb-1">AI SUMMARY</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{record.aiAnalysis.summary}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-center pl-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-mono">{record.victimId || record._id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase ${record.status === 'closed' ? 'text-safety' : 'text-primary'
                          }`}>
                          {record.status}
                        </span>
                        <button
                          onClick={() => handleDownloadSingleCase(record)}
                          className="rounded-full bg-secondary/50 p-1.5 text-foreground hover:bg-secondary transition-colors"
                          title="Download Individual Report"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-50">
                  <p className="text-sm">No detailed records available.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;

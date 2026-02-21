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
  const [activeTab, setActiveTab] = useState("oversight"); // 'oversight' | 'secure-records'
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [oversightData, setOversightData] = useState<any[]>([]);

  // Detailed View State
  const [selectedInst, setSelectedInst] = useState<string | null>(null);
  const [instRecords, setInstRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Secure Records State
  const [secureRecords, setSecureRecords] = useState<any[]>([]);
  const [loadingSecure, setLoadingSecure] = useState(false);

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

    fetchOversight();
    fetchSecureRecords();
  }, []);

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
        ) : (
          <div className="space-y-4">
            {loadingSecure ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Loading secure records...</p>
              </div>
            ) : secureRecords.length > 0 ? (
              secureRecords.map((record) => (
                <div key={record._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${record.internalPriority === 'CRITICAL' ? 'bg-[#ff0000]' :
                    record.internalPriority === 'HIGH' ? 'bg-emergency' :
                      record.internalPriority === 'MEDIUM' ? 'bg-warning' : 'bg-safety'
                    }`} />

                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full mb-2 inline-block ${record.internalPriority === 'CRITICAL' ? 'bg-[#ff0000]/10 text-[#ff0000] border-2 border-[#ff0000]/20' :
                        record.internalPriority === 'HIGH' ? 'bg-emergency/10 text-emergency' :
                          record.internalPriority === 'MEDIUM' ? 'bg-warning/10 text-amber-500' :
                            'bg-safety/10 text-safety'
                        }`}>
                        {record.internalPriority} PRIORITY
                      </span>
                      <h4 className="font-display font-bold text-foreground">{record.complaintId?.type || 'Unknown Type'}</h4>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1">CONFIDENTIAL NOTES</p>
                      <p className="text-xs text-foreground italic">"{record.confidentialNotes || 'No notes available.'}"</p>
                    </div>

                    {/* Attached Evidence */}
                    {record.complaintId?.evidence && record.complaintId.evidence.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> ATTACHED EVIDENCE
                        </p>
                        <div className="flex flex-col gap-2">
                          {record.complaintId.evidence.map((item: any, eidx: number) => (
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

                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center pl-2">
                    <span className="text-xs text-muted-foreground">Victim: <span className="font-mono font-bold text-foreground">{record.complaintId?.victimId}</span></span>
                    <span className="text-[10px] font-bold uppercase text-primary bg-primary/5 px-2 py-1 rounded">
                      {record.investigationStatus.replace('_', ' ')}
                    </span>
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
              <Button variant="ghost" size="icon" onClick={closeDetails} className="rounded-full">
                <span className="sr-only">Close</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </Button>
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
                  <div key={record._id} className="rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${record.status === 'closed' ? 'bg-safety' :
                      record.status === 'in-progress' ? 'bg-primary' : 'bg-warning'
                      }`} />

                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</p>
                        <h4 className="font-display font-bold text-foreground mt-0.5">{record.type}</h4>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${record.priority === 'High' ? 'bg-emergency/10 text-emergency' :
                        record.priority === 'Medium' ? 'bg-warning/10 text-amber-500' :
                          'bg-safety/10 text-safety'
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
                        <span className="font-mono">{record.victimId}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${record.status === 'closed' ? 'text-safety' : 'text-primary'
                        }`}>
                        {record.status}
                      </span>
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

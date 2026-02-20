import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Download, FileText, Calendar, MapPin, Shield, Image as ImageIcon, Music, Film } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import CaseCard from "@/components/CaseCard";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

import { useComplaints, Complaint } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";

const TrackCases = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaints();
  const { user } = useAuth();

  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState("All");

  // Filter for the current institution
  const institution = user?.institution || localStorage.getItem("user_institution") || "Delhi University";
  const userCases = complaints.filter(c => {
    const instMatch = c.institution === institution;
    if (!instMatch) return false;
    if (filter === "All") return true;
    if (filter === "Active") return c.status !== "closed";
    if (filter === "Closed") return c.status === "closed";
    return true;
  });

  const generatePoshReport = (c: Complaint) => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    const evidenceHtml = c.evidence?.map(e => `<li>${e.fileType.toUpperCase()}: ${e.name}</li>`).join('') || 'None';

    reportWindow.document.write(`
      <html>
        <head>
          <title>POSH Act Legal Report - ${c.complaintId}</title>
          <style>
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; border: 1px solid #eee; }
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
            .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #4f46e5; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .field { margin-bottom: 10px; }
            .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: 500; }
            .description { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6; }
            .footer { margin-top: 50px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .no-print { display: none; } body { border: none; } }
            .btn { background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <button class="btn no-print" onclick="window.print()">Print / Save as PDF</button>
          <div class="header">
            <h1>LEGAL COMPLAINT REPORT</h1>
            <p>Under Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013</p>
          </div>
          
          <div class="section">
            <div class="section-title">Case Information</div>
            <div class="grid">
              <div class="field"><div class="label">Reference ID</div><div class="value">${c.complaintId}</div></div>
              <div class="field"><div class="label">Institution</div><div class="value">${c.institution}</div></div>
              <div class="field"><div class="label">Filing Date</div><div class="value">${new Date(c.date).toLocaleString()}</div></div>
              <div class="field"><div class="label">Status</div><div class="value">${c.status.toUpperCase()}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Complainant Details</div>
            <div class="grid">
              <div class="field"><div class="label">Victim Anonymous ID</div><div class="value">${c.victimId || 'VICTIM-ANON'}</div></div>
              <div class="field"><div class="label">Organization</div><div class="value">${c.institution}</div></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Nature of Complaint</div>
            <div class="field"><div class="label">Category</div><div class="value">${c.type}</div></div>
            <div class="field"><div class="label">Location of Incident</div><div class="value">${c.location || 'Not specified'}</div></div>
          </div>

          <div class="section">
            <div class="section-title">Incident Description</div>
            <div class="description">${c.description}</div>
          </div>

          <div class="section">
            <div class="section-title">Evidence Log</div>
            <ul>${evidenceHtml}</ul>
            <p style="font-size: 12px; color: #666 italic;">Note: Multimedia evidence is stored securely in the SafeVoice Cloud Registry.</p>
          </div>

          <div class="footer">
            <p>Generated by SafeVoice - POSH Compliance Engine</p>
            <p>This is a digitally generated legal report for Internal Committee (IC) records.</p>
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="My Cases" subtitle="Track your complaints" showBack onBack={() => navigate("/dashboard")} />

      <div className="flex-1 px-4 py-4">
        <div className="mb-4 flex gap-2">
          {["All", "Active", "Closed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${f === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {userCases.length > 0 ? (
            userCases.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <CaseCard
                  caseId={c.complaintId || c.id}
                  date={new Date(c.date).toLocaleDateString()}
                  status={c.status as any}
                  priority={c.priority as any}
                  institution={c.institution}
                  onClick={() => setSelectedCase(c)}
                />
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No cases found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="h-[90vh] w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-2xl sm:h-auto sm:rounded-3xl"
            >
              <div className="flex items-center justify-between border-bottom pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{selectedCase.complaintId}</h3>
                  <p className="text-xs text-muted-foreground">Detailed Case Overview</p>
                </div>
                <button onClick={() => setSelectedCase(null)} className="rounded-full bg-muted p-2 hover:bg-muted/80">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6 overflow-y-auto pb-8" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                {/* Status & Priority Badge */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${selectedCase.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    {selectedCase.status.replace('_', ' ')}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${selectedCase.priority === 'emergency' ? 'bg-emergency/10 text-emergency' : 'bg-secondary/10 text-secondary'}`}>
                    {selectedCase.priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                      <Calendar className="h-3 w-3" />
                      Date of Incident
                    </div>
                    <p className="mt-1 text-sm font-medium">{new Date(selectedCase.date).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                      <MapPin className="h-3 w-3" />
                      Location
                    </div>
                    <p className="mt-1 text-sm font-medium">{selectedCase.location || 'Not Specified'}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                    <Shield className="h-3 w-3 text-secondary" />
                    Harassment Category
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{selectedCase.type}</p>
                </div>

                <div className="rounded-xl bg-accent p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Detailed Narrative</p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedCase.description}</p>
                </div>

                {/* Evidence Section */}
                {selectedCase.evidence && selectedCase.evidence.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Multimedia Evidence</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedCase.evidence.map((ev, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg border border-border bg-muted/50 overflow-hidden">
                          {ev.fileType === 'image' ? (
                            <img src={ev.url} alt="evidence" className="h-full w-full object-cover" />
                          ) : ev.fileType === 'audio' ? (
                            <div className="flex h-full w-full items-center justify-center bg-secondary/10">
                              <Music className="h-6 w-6 text-secondary" />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                              <Film className="h-6 w-6 text-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto border-t border-border pt-4">
                <Button
                  onClick={() => generatePoshReport(selectedCase)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl gradient-primary py-6 font-bold"
                >
                  <Download className="h-5 w-5" />
                  Download POSH Legal Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default TrackCases;

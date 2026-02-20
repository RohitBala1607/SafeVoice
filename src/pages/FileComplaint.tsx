import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, MapPin, Upload, Shield, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";

import { getHarassmentTypeNames } from "@/data/harassment-modules";

const harassmentTypes = getHarassmentTypeNames();

const FileComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addComplaint } = useComplaints();
  const { user } = useAuth();
  const { toast } = useToast();

  const preSelectedType = (location.state as any)?.selectedType || "";

  const [anonymous, setAnonymous] = useState(true);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [type, setType] = useState(preSelectedType);
  const [showTypes, setShowTypes] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await addComplaint({
        type: type as any,
        description,
        location: locationStr,
        date: date || new Date().toISOString(),
        complaintId: `POSH-${Date.now()}` // Generating a temporary ID if not handled by backend
      });

      toast({
        title: "Complaint Filed Successfully",
        description: `Your case reference is ${result.id || 'noted'}. It is encrypted and secured.`,
      });
      navigate("/cases");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit your complaint. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="File Complaint" subtitle="POSH Act Compliant" showBack onBack={() => navigate("/dashboard")} />

      <div className="flex-1 px-4 py-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">Anonymous Reporting</span>
            </div>
            <button
              onClick={() => setAnonymous(!anonymous)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${anonymous ? "bg-safety/10 text-safety" : "bg-muted text-muted-foreground"
                }`}
            >
              {anonymous ? "ON" : "OFF"}
            </button>
          </div>

          {/* Institution */}
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Institution</p>
            <p className="mt-1 text-sm font-medium text-foreground">{user?.institution || "Loading..."}</p>
          </div>

          {/* Harassment Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Type of Harassment</label>
            <button
              onClick={() => setShowTypes(!showTypes)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm text-left"
            >
              <span className={type ? "text-foreground" : "text-muted-foreground"}>{type || "Select category..."}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {showTypes && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1 rounded-lg border border-border bg-card shadow-elevated">
                {harassmentTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setShowTypes(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {t}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Incident Description</label>
            <Textarea
              rows={4}
              placeholder="Describe the incident in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Date & Time of Incident</label>
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Incident Location (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="e.g. Office Block A, Floor 3" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} />
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Evidence Upload</label>
            <button className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
              <Upload className="h-6 w-6" />
              <span className="text-xs font-medium">Tap to upload images, audio, or documents</span>
              <span className="text-[10px]">Max 10MB per file</span>
            </button>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-accent px-3 py-2">
            <Shield className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Per POSH Act Section 16, your identity and complaint details are strictly confidential.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-4 backdrop-blur-lg">
        <Button
          onClick={handleSubmit}
          disabled={!description || !type || loading}
          className="w-full rounded-xl gradient-primary py-6 text-sm font-semibold text-primary-foreground"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Submitting Securely..." : "Submit Complaint Securely"}
        </Button>
      </div>
    </div>
  );
};

export default FileComplaint;

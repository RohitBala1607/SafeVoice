import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, MapPin, Upload, Shield, ChevronDown, Loader2, Image as ImageIcon, Music, Film, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppHeader from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";
import { audioStorage, SOSRecording } from "@/lib/audio-storage";
import { getHarassmentTypeNames } from "@/data/harassment-modules";

const harassmentTypes = getHarassmentTypeNames();

interface EvidenceFile {
  fileType: 'image' | 'audio' | 'video';
  url: string;
  name: string;
  preview?: string;
  isSOS?: boolean;
}

const FileComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addComplaint } = useComplaints();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preSelectedType = (location.state as any)?.selectedType || "";

  const [anonymous, setAnonymous] = useState(true);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [type, setType] = useState(preSelectedType);
  const [showTypes, setShowTypes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [sosRecordings, setSosRecordings] = useState<SOSRecording[]>([]);
  const [showSosModal, setShowSosModal] = useState(false);

  useEffect(() => {
    loadSosRecordings();
  }, []);

  const loadSosRecordings = async () => {
    try {
      const recordings = await audioStorage.getAllRecordings();
      setSosRecordings(recordings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error("Failed to load SOS recordings:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newEvidence: EvidenceFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.startsWith('image/') ? 'image' :
        file.type.startsWith('audio/') ? 'audio' :
          file.type.startsWith('video/') ? 'video' : null;

      if (!fileType) {
        toast({
          variant: "destructive",
          title: "Unsupported File",
          description: `${file.name} is not a supported image, audio, or video file.`,
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `${file.name} exceeds the 10MB limit.`,
        });
        continue;
      }

      const base64 = await convertToBase64(file);
      newEvidence.push({
        fileType,
        url: base64,
        name: file.name,
        preview: fileType === 'image' ? base64 : undefined
      });
    }

    setEvidence([...evidence, ...newEvidence]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSosEvidence = async (rec: SOSRecording) => {
    const fileType = 'audio';
    const base64 = await blobToBase64(rec.blob);

    // Check if already added
    if (evidence.find(e => e.name === rec.id)) {
      toast({ title: "Already added", description: "This SOS recording is already attached." });
      return;
    }

    setEvidence([...evidence, {
      fileType,
      url: base64,
      name: rec.id,
      isSOS: true
    }]);

    setShowSosModal(false);
    toast({ title: "SOS Clip Attached", description: "The recorded SOS audio has been linked to this case." });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeEvidence = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await addComplaint({
        type: type as any,
        description,
        location: locationStr,
        date: date || new Date().toISOString(),
        complaintId: `POSH-${Date.now()}`,
        evidence: evidence.map(({ fileType, url, name }) => ({ fileType, url, name }))
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
          {/* ... existing fields ... */}
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

          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Institution</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {user?.institution || localStorage.getItem("user_institution") || "SafeVoice Network"}
            </p>
          </div>

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

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Date & Time of Incident</label>
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Incident Location (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="e.g. Office Block A, Floor 3" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} />
            </div>
          </div>

          {/* Evidence Upload */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Evidence Upload</label>
              {sosRecordings.length > 0 && (
                <button
                  onClick={() => setShowSosModal(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-secondary uppercase tracking-wider hover:underline"
                >
                  <Music className="h-3 w-3" />
                  Import SOS Audio ({sosRecordings.length})
                </button>
              )}
            </div>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-8 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs font-medium">Tap to upload images, audio, or video</span>
              <span className="text-[10px]">Max 10MB per file</span>
            </button>

            {/* SOS MODAL */}
            {showSosModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl overflow-hidden"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-foreground">SOS Audio Vault</h3>
                    <button onClick={() => setShowSosModal(false)} className="rounded-full bg-muted p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                    {sosRecordings.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => addSosEvidence(rec)}
                        className="w-full flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                          <Music className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{rec.id}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(rec.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-full bg-secondary/10 px-2 py-0.5 text-[8px] font-bold text-secondary uppercase">
                          SOS Clip
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-[10px] text-center text-muted-foreground">
                    These clips were auto-recorded during panic triggers.
                  </p>
                </motion.div>
              </div>
            )}

            {/* Previews */}
            {evidence.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {evidence.map((file, idx) => (
                  <div key={idx} className={`relative group overflow-hidden rounded-lg border p-2 ${file.isSOS ? 'border-secondary/40 bg-secondary/5' : 'border-border bg-card'}`}>
                    <div className="flex items-center gap-2">
                      {file.fileType === 'image' ? (
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-muted">
                          <img src={file.url} alt="preview" className="h-full w-full object-cover" />
                        </div>
                      ) : file.fileType === 'audio' ? (
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded ${file.isSOS ? 'bg-secondary/20' : 'bg-primary/10'}`}>
                          <Music className={`h-5 w-5 ${file.isSOS ? 'text-secondary' : 'text-primary'}`} />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-secondary/10">
                          <Film className="h-5 w-5 text-secondary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-bold text-foreground">{file.name}</p>
                        <p className={`text-[8px] uppercase ${file.isSOS ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
                          {file.isSOS ? 'SOS EVIDENCE' : file.fileType}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEvidence(idx)}
                      className="absolute right-1 top-1 rounded-full bg-emergency p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
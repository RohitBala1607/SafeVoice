import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  EyeOff,
  Mic,
  Phone,
  MessageSquare,
  AlertTriangle,
  Play,
  MapPin,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { audioStorage, SOSRecording } from "@/lib/audio-storage";

type TriggerMode = "hidden" | "floating" | "gesture";

interface SafetyConfig {
  sosEnabled: boolean;
  stealthMode: boolean;
  autoAudio: boolean;
  smsAlerts: boolean;
  whatsappShare: boolean;
  triggerMode: TriggerMode;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // with country code (91xxxxxxxxxx)
}

const SafetySettings = () => {
  const navigate = useNavigate();

  // 🔥 Dynamic Persistent State (Saved in localStorage)
  const [config, setConfig] = useState<SafetyConfig>({
    sosEnabled: true,
    stealthMode: true,
    autoAudio: true,
    smsAlerts: true,
    whatsappShare: true,
    triggerMode: "gesture",
  });

  // 📞 Emergency Contacts State
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // 🔐 Real-time permission status
  const [permissions, setPermissions] = useState({
    location: false,
    microphone: false,
    notifications: false,
  });

  // 🗄️ Audio Evidence State
  const [recordings, setRecordings] = useState<SOSRecording[]>([]);

  // 📦 Load saved config + contacts on startup
  useEffect(() => {
    const savedConfig = localStorage.getItem("safety_config");
    const savedContacts = localStorage.getItem("emergency_contacts");

    if (savedConfig) setConfig((prev) => ({ ...prev, ...JSON.parse(savedConfig) }));
    if (savedContacts) setContacts(JSON.parse(savedContacts));

    checkPermissions();
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    const data = await audioStorage.getAllRecordings();
    setRecordings(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const deleteRecording = async (id: string) => {
    await audioStorage.deleteRecording(id);
    toast.success("Recording deleted");
    loadRecordings();
  };

  // 💾 Persist settings dynamically
  useEffect(() => {
    localStorage.setItem("safety_config", JSON.stringify(config));
  }, [config]);

  // 💾 Persist contacts
  useEffect(() => {
    localStorage.setItem("emergency_contacts", JSON.stringify(contacts));
  }, [contacts]);

  // 🔎 REAL-TIME PERMISSION CHECK
  const checkPermissions = async () => {
    try {
      if ("permissions" in navigator) {
        const loc = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        const mic = await navigator.permissions.query({ name: "microphone" as PermissionName });
        const notif = await navigator.permissions.query({ name: "notifications" });

        setPermissions({
          location: loc.state === "granted",
          microphone: mic.state === "granted",
          notifications: notif.state === "granted",
        });
      }
    } catch (error) {
      console.log("Permission check not supported");
    }
  };

  // 🎯 Request specific permission dynamically
  const requestPermission = async (type: "location" | "microphone" | "notifications") => {
    try {
      if (type === "location") {
        navigator.geolocation.getCurrentPosition(
          () => {
            toast.success("Location permission granted");
            checkPermissions();
          },
          () => openSettings()
        );
      }

      if (type === "microphone") {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        toast.success("Microphone permission granted");
        checkPermissions();
      }

      if (type === "notifications") {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          toast.success("Notifications enabled");
        } else {
          openSettings();
        }
        checkPermissions();
      }
    } catch (e) {
      openSettings();
    }
  };

  // ⚙️ Open device/app settings
  const openSettings = () => {
    toast.warning("Please enable permissions from device settings");
    window.open("about:preferences", "_blank");
  };

  const updateConfig = (key: keyof SafetyConfig, value: boolean | TriggerMode) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // ➕ Add Emergency Contact
  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Enter name and phone number");
      return;
    }

    const cleanedPhone = newPhone.replace(/\D/g, "");
    const formattedPhone = cleanedPhone.startsWith("91")
      ? cleanedPhone
      : `91${cleanedPhone}`;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName,
      phone: formattedPhone,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewName("");
    setNewPhone("");
    toast.success("Emergency contact added");
  };

  // ❌ Remove Contact
  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success("Contact removed");
  };

  // 📍 Send WhatsApp Location Alert to Contacts
  const sendWhatsAppAlertToContacts = () => {
    if (contacts.length === 0) {
      toast.error("No emergency contacts added");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        const mapsLink = `https://maps.google.com/?q=${lat},${long}`;

        const message = encodeURIComponent(
          `🚨 EMERGENCY ALERT 🚨
I am in danger. Please help me immediately.

📍 Live Location:
${mapsLink}

Sent via Safety SOS System`
        );

        contacts.forEach((contact) => {
          const whatsappUrl = `https://wa.me/${contact.phone}?text=${message}`;
          window.open(whatsappUrl, "_blank");
        });

        toast.success("WhatsApp alert opened for all emergency contacts");
      },
      () => {
        toast.error("Unable to fetch location");
      }
    );
  };

  const handleTestSOS = () => {
    toast.info("🔴 Live SOS Simulation Started", {
      description: "Location + WhatsApp alert simulation (no real SMS sent).",
      duration: 4000,
    });

    if (config.whatsappShare) {
      sendWhatsAppAlertToContacts();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader
        title="Safety & Emergency"
        subtitle="Real-Time SOS Control Center"
        showBack
        onBack={() => navigate("/dashboard")}
      />

      <div className="flex-1 space-y-4 px-4 py-4">
        {/* MASTER SOS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-emergency/20 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-emergency" />
              <div>
                <h3 className="text-sm font-semibold">SOS Emergency System</h3>
                <p className="text-xs text-muted-foreground">
                  Real-time tracking, alerts & recording
                </p>
              </div>
            </div>
            <Switch
              checked={config.sosEnabled}
              onCheckedChange={(val) => updateConfig("sosEnabled", val)}
            />
          </div>
        </motion.div>

        {/* 🔐 LIVE PERMISSION STATUS */}
        <div className="rounded-xl border bg-card p-4">
          <h4 className="text-xs font-semibold mb-3 uppercase text-muted-foreground">
            Real-Time Permission Status
          </h4>

          {[
            { label: "Location (GPS)", granted: permissions.location, key: "location", icon: MapPin },
            { label: "Microphone", granted: permissions.microphone, key: "microphone", icon: Mic },
            { label: "Notifications", granted: permissions.notifications, key: "notifications", icon: MessageSquare },
          ].map((perm) => (
            <div key={perm.label} className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <perm.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{perm.label}</p>
              </div>

              <button
                onClick={() => requestPermission(perm.key as any)}
                className={`text-xs px-3 py-1 rounded-full ${perm.granted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}
              >
                {perm.granted ? "Granted" : "Enable"}
              </button>
            </div>
          ))}

          <button
            onClick={openSettings}
            className="flex items-center gap-2 text-xs text-primary mt-2"
          >
            <Settings className="h-3 w-3" />
            Open Device Settings
          </button>
        </div>

        {/* DYNAMIC FEATURES */}
        {config.sosEnabled && (
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">
              Emergency Feature Configuration
            </h4>

            {[
              { label: "Auto Audio Recording", key: "autoAudio", desc: "Records audio during SOS", icon: Mic },
              { label: "SMS Alerts (Helpline 112)", key: "smsAlerts", desc: "Send distress SMS with live location", icon: MessageSquare },
              { label: "WhatsApp Live Location", key: "whatsappShare", desc: "Share location with trusted contacts", icon: Phone },
              { label: "Stealth Mode", key: "stealthMode", desc: "Hide SOS UI indicators", icon: EyeOff },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={config[item.key as keyof SafetyConfig] as boolean}
                  onCheckedChange={(val) => updateConfig(item.key as keyof SafetyConfig, val)}
                />
              </div>
            ))}
          </div>
        )}

        {/* 📞 EMERGENCY CONTACTS (NEW) */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
            Trusted Emergency Contacts (WhatsApp Alerts)
          </h4>

          <div className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              placeholder="Contact Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone Number (9876543210)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <button
              onClick={addContact}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-3 w-3" />
              Add Emergency Contact
            </button>
          </div>

          <div className="space-y-2">
            {contacts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No contacts added. Add at least one for WhatsApp SOS alerts.
              </p>
            )}

            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                <div>
                  <p className="text-xs font-semibold">{contact.name}</p>
                  <p className="text-[10px] text-muted-foreground">+{contact.phone}</p>
                </div>
                <button onClick={() => removeContact(contact.id)}>
                  <Trash2 className="h-4 w-4 text-emergency" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={sendWhatsAppAlertToContacts}
            className="mt-4 w-full rounded-lg bg-green-600 py-2 text-xs font-semibold text-white"
          >
            Send Test WhatsApp Location Alert
          </button>
        </div>

        {/* TEST SOS */}
        <button
          onClick={handleTestSOS}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emergency/30 bg-emergency/5 px-4 py-4 text-sm font-semibold text-emergency"
        >
          <Play className="h-4 w-4" />
          Run Real-Time SOS Simulation (30s Tracking)
        </button>

        {/* 🎙️ SOS AUDIO EVIDENCE */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
            <Mic className="h-3 w-3" /> SOS Audio Evidence (IndexedDB)
          </h4>

          <div className="space-y-3">
            {recordings.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground italic">
                No SOS recordings found. Evidence is automatically saved here when SOS is triggered.
              </p>
            )}

            {recordings.map((rec) => (
              <div key={rec.id} className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-bold">{rec.id}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(rec.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => deleteRecording(rec.id)} className="p-1 hover:bg-emergency/10 rounded">
                    <Trash2 className="h-3.5 w-3.5 text-emergency" />
                  </button>
                </div>

                <audio
                  controls
                  src={URL.createObjectURL(rec.blob)}
                  className="h-8 w-full"
                />
              </div>
            ))}
          </div>

          <p className="mt-4 text-[9px] text-muted-foreground italic text-center">
            Evidence is stored locally in your browser's secure database (IndexedDB) and is not uploaded to any server.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-warning/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3 w-3 text-warning" />
          <p className="text-[10px] text-muted-foreground">
            When SOS is triggered, live location will be sent to all trusted contacts via WhatsApp automatically.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SafetySettings;
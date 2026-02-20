import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Hand, Mic, Phone, MessageSquare, AlertTriangle, Play, MapPin, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

type TriggerMode = "hidden" | "floating" | "gesture";

interface SafetyConfig {
  sosEnabled: boolean;
  stealthMode: boolean;
  autoAudio: boolean;
  smsAlerts: boolean;
  whatsappShare: boolean;
  triggerMode: TriggerMode;
}

const SafetySettings = () => {
  const navigate = useNavigate();

  // 🔥 Dynamic Persistent State (Saved in localStorage)
  const [config, setConfig] = useState<SafetyConfig>({
    sosEnabled: false,
    stealthMode: true,
    autoAudio: true,
    smsAlerts: true,
    whatsappShare: true,
    triggerMode: "gesture",
  });

  // 🔐 Real-time permission status
  const [permissions, setPermissions] = useState({
    location: false,
    microphone: false,
    notifications: false,
  });

  // 📦 Load saved config on startup
  useEffect(() => {
    const saved = localStorage.getItem("safety_config");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    checkPermissions();
  }, []);

  // 💾 Persist settings dynamically
  useEffect(() => {
    localStorage.setItem("safety_config", JSON.stringify(config));
  }, [config]);

  // 🔎 REAL-TIME PERMISSION CHECK
  const checkPermissions = async () => {
    try {
      // Location
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

  // ⚙️ Open device/app settings (Mobile WebView / PWA support)
  const openSettings = () => {
    toast.warning("Please enable permissions from device settings");
    window.open("about:preferences", "_blank"); // fallback
  };

  const updateConfig = (key: keyof SafetyConfig, value: boolean | TriggerMode) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestSOS = () => {
    toast.info("🔴 Live SOS Simulation Started", {
      description: "Audio + Location tracking + Alerts simulated in real-time.",
      duration: 4000,
    });
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

        {/* 🔐 LIVE PERMISSION STATUS CARD */}
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
                className={`text-xs px-3 py-1 rounded-full ${
                  perm.granted ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
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
              Dynamic Emergency Features (Real-Time)
            </h4>

            {[
              { label: "Auto Audio Recording", key: "autoAudio", desc: "Records audio during SOS", icon: Mic },
              { label: "SMS Alerts (Helpline 112)", key: "smsAlerts", desc: "Send distress SMS with live location", icon: MessageSquare },
              { label: "WhatsApp Live Location", key: "whatsappShare", desc: "Share location every 30 seconds", icon: Phone },
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

        {/* TEST SOS */}
        <button
          onClick={handleTestSOS}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emergency/30 bg-emergency/5 px-4 py-4 text-sm font-semibold text-emergency"
        >
          <Play className="h-4 w-4" />
          Run Real-Time SOS Simulation (30s Tracking)
        </button>

        <div className="flex items-start gap-2 rounded-lg bg-warning/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3 w-3 text-warning" />
          <p className="text-[10px] text-muted-foreground">
            Permissions are checked in real-time. SOS will auto-run without popups once permissions are granted during setup.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SafetySettings;
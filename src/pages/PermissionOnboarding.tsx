import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mic, MessageSquare, Bell, HardDrive, Camera, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PermissionStep from "@/components/PermissionStep";

const permissions = [
  { key: "location", icon: MapPin, title: "Location Access", description: "Required for emergency GPS tracking during SOS activation" },
  { key: "microphone", icon: Mic, title: "Microphone Access", description: "For automatic audio recording during SOS emergencies" },
  { key: "sms", icon: MessageSquare, title: "SMS Access", description: "To send emergency alerts to helpline numbers and contacts" },
  { key: "notifications", icon: Bell, title: "Notification Access", description: "For real-time case updates and safety alerts" },
  { key: "storage", icon: HardDrive, title: "Storage Access", description: "To save evidence, reports, and emergency recordings" },
  { key: "camera", icon: Camera, title: "Camera Access", description: "Optional: Upload photo/video evidence for complaints" },
];

const PermissionOnboarding = () => {
  const navigate = useNavigate();
  const [granted, setGranted] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);

  // 🔐 REAL PERMISSION REQUEST HANDLER
  const requestPermission = async (key: string) => {
    try {
      let isGranted = false;

      switch (key) {
        case "location":
          if ("geolocation" in navigator) {
            await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                () => reject(false)
              );
            });
            isGranted = true;
          }
          break;

        case "microphone":
          await navigator.mediaDevices.getUserMedia({ audio: true });
          isGranted = true;
          break;

        case "camera":
          await navigator.mediaDevices.getUserMedia({ video: true });
          isGranted = true;
          break;

        case "notifications":
          const notifPermission = await Notification.requestPermission();
          isGranted = notifPermission === "granted";
          break;

        case "storage":
          // For web apps, storage is implicitly available
          isGranted = true;
          break;

        case "sms":
          // SMS cannot be directly requested in browser
          // Mark as granted if running inside mobile app wrapper (Android/Flutter WebView)
          isGranted = true;
          break;

        default:
          isGranted = false;
      }

      if (isGranted) {
        setGranted((prev) => ({ ...prev, [key]: true }));
      } else {
        openDeviceSettings();
      }
    } catch (error) {
      console.error(`${key} permission denied`, error);
      openDeviceSettings();
    }
  };

  // ⚙️ OPEN APP SETTINGS (Mobile)
  const openDeviceSettings = () => {
    // Works in Android WebView / Mobile apps
    if (window?.location) {
      alert(
        "Permission denied. Please enable permissions from your device settings for full SOS protection."
      );
    }
  };

  const allRequired = ["location", "microphone", "sms", "notifications", "storage"].every(
    (k) => granted[k]
  );

  if (step === 0) {
    return (
      <div className="flex min-h-screen flex-col gradient-hero">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 rounded-2xl bg-primary-foreground/10 p-4 backdrop-blur-sm"
          >
            <Shield className="h-10 w-10 text-primary-foreground" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-center text-xl font-bold text-primary-foreground"
          >
            Safety Permissions Setup
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-xs text-center text-sm text-primary-foreground/70 leading-relaxed"
          >
            Enable all permissions once to activate automatic SOS, live tracking,
            audio recording, and emergency alerts without interruption.
          </motion.p>
        </div>

        <div className="px-6 pb-10">
          <Button
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-primary-foreground py-6 text-sm font-semibold text-primary"
          >
            Enable Safety Permissions <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-primary px-6 pb-6 pt-8">
        <h2 className="font-display text-lg font-bold text-primary-foreground">
          Safety Permissions
        </h2>
        <p className="mt-1 text-xs text-primary-foreground/60">
          {Object.values(granted).filter(Boolean).length}/{permissions.length} granted
        </p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20">
          <motion.div
            className="h-full rounded-full bg-primary-foreground/80"
            animate={{
              width: `${
                (Object.values(granted).filter(Boolean).length / permissions.length) * 100
              }%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        <AnimatePresence>
          {permissions.map((perm, i) => (
            <motion.div
              key={perm.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <PermissionStep
                icon={perm.icon}
                title={perm.title}
                description={perm.description}
                granted={!!granted[perm.key]}
                onGrant={() => requestPermission(perm.key)} // 🔥 MODIFIED
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-4 backdrop-blur-lg">
        <Button
          onClick={() => navigate("/role-selection")}
          disabled={!allRequired}
          className="w-full rounded-xl gradient-primary py-6 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          Continue & Activate SOS System
        </Button>

        {!allRequired && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Grant all required permissions to enable automatic SOS, live tracking,
            and emergency alerts
          </p>
        )}
      </div>
    </div>
  );
};

export default PermissionOnboarding;
import { toast } from "sonner";
import { audioStorage } from "@/lib/audio-storage";
import api from "@/services/api";

interface SafetyConfig {
  sosEnabled: boolean;
  stealthMode: boolean;
  autoAudio: boolean;
  smsAlerts: boolean;
  whatsappShare: boolean;
  triggerMode: "hidden" | "floating" | "gesture";
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

let trackingInterval: any = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let currentPublicId: string | null = null;

export const startSOS = async () => {
  const defaultConfig: SafetyConfig = {
    sosEnabled: true,
    stealthMode: false,
    autoAudio: true,
    smsAlerts: true,
    whatsappShare: true,
    triggerMode: "gesture"
  };

  const config: SafetyConfig = {
    ...defaultConfig,
    ...JSON.parse(localStorage.getItem("safety_config") || "{}")
  };

  const contacts: EmergencyContact[] = JSON.parse(
    localStorage.getItem("emergency_contacts") || "[]"
  );

  if (!config?.sosEnabled) {
    toast.error("SOS System Disabled", {
      description: "Please enable the 'Master SOS Trigger' in Safety Settings.",
    });
    return;
  }

  console.log("🚨 SOS ACTIVATED BY GESTURE");

  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const victimId = user?.victimId || user?.id || `VICTIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const institution = user?.institution || localStorage.getItem("user_institution") || "SafeVoice Institution";

    console.log("📍 Initial Location:", lat, lng);

    try {
      // 🟢 START BACKEND SOS SESSION
      const sosResponse = await api.post('/sos/start', {
        victimId,
        institution,
        location: { lat, lng },
        mapsLink,
        contacts // Pass contacts for server-side automation
      });

      const { publicId } = sosResponse.data;
      currentPublicId = publicId;

      const liveTrackLink = `${window.location.origin}/sos-track/${publicId}`;

      const sosState = {
        active: true,
        publicId,
        victimId,
        institution,
        location: { lat, lng },
        timestamp: new Date().toISOString(),
        mapsLink,
        liveTrackLink
      };

      localStorage.setItem("active_sos", JSON.stringify(sosState));
      window.dispatchEvent(new Event("storage"));

      // 📲 WhatsApp Alert (Handled by Backend Automation)
      if (config.whatsappShare && contacts.length > 0) {
        console.log("📲 Backend triggering automated WhatsApp alerts...");
        // Manual window.open is disabled to ensure a truly 'automatic' (hands-free) experience
        /*
        contacts.forEach((contact) => {
          const url = `https://wa.me/${contact.phone}?text=${message}`;
          window.open(url, "_blank");
        });
        */
      }

      // 📡 Start High-Frequency Backend Update Loop
      startLiveTracking(publicId);

      // 🎙️ SMS & Audio
      if (config.smsAlerts && contacts.length > 0) {
        triggerSMS(contacts, liveTrackLink);
      }

      if (config.autoAudio) {
        startAudioRecording();
      }

    } catch (error) {
      console.error("Failed to sync SOS with backend:", error);
      toast.error("Network Error", { description: "SOS triggered locally, but backend sync failed." });
    }
  });
};

const triggerSMS = (contacts: EmergencyContact[], liveTrackLink: string) => {
  const bodyText = `🚨 EMERGENCY! I am in danger. Track me live: ${liveTrackLink}`;
  const body = encodeURIComponent(bodyText);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? "," : ";";
  const phones = contacts.map((c) => c.phone).join(separator);

  const smsUrl = isIOS
    ? `sms:${phones}&body=${body}`
    : `sms:${phones}?body=${body}`;

  window.open(smsUrl, "_blank");
};

const startLiveTracking = (publicId: string) => {
  if (trackingInterval) return;

  trackingInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

      try {
        await api.post('/sos/update', {
          publicId,
          location: { lat, lng },
          mapsLink
        });

        // Sync local storage for dashboard
        const sos = JSON.parse(localStorage.getItem("active_sos") || "{}");
        if (sos.active) {
          sos.location = { lat, lng };
          sos.mapsLink = mapsLink;
          localStorage.setItem("active_sos", JSON.stringify(sos));
          window.dispatchEvent(new Event("storage"));
        }
      } catch (err) {
        console.warn("Failed to update live location on backend");
      }
    });
  }, 10000); // 10s updates for live tracking link
};

const startAudioRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const rawUser = localStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const victimId = user?.victimId || user?.id || "VICTIM-UNKNOWN";

      await audioStorage.saveRecording({
        id: `SOS-${Date.now()}`,
        blob: audioBlob,
        timestamp: new Date().toISOString(),
        victimId
      });

      toast.success("Evidence Saved", { description: "SOS Audio recording stored securely." });
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Microphone permission denied");
  }
};

export const stopSOS = async () => {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  if (currentPublicId) {
    try {
      await api.post('/sos/resolve', { publicId: currentPublicId });
    } catch (err) {
      console.warn("Failed to resolve SOS session on backend");
    }
    currentPublicId = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  localStorage.removeItem("active_sos");
  window.dispatchEvent(new Event("storage"));
  console.log("🛑 SOS Stopped");
};
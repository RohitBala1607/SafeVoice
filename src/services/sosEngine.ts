// sosEngine.ts

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

export const startSOS = async () => {
  const defaultConfig: SafetyConfig = {
    sosEnabled: true,
    stealthMode: false,
    autoAudio: true,
    smsAlerts: false,
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
    console.log("SOS Disabled in settings");
    return;
  }

  console.log("🚨 SOS ACTIVATED BY GESTURE");

  // 1️⃣ Get Location First
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    const mapsLink = `https://maps.google.com/?q=${lat},${long}`;

    // 🔴 BROADCAST SOS TO DASHBOARDS (Dynamic System)
    const victimId = localStorage.getItem("user_id") || `VICTIM-${Math.floor(1000 + Math.random() * 9000)}`;
    const institution = localStorage.getItem("user_institution") || "Delhi University";

    console.log("📍 Location Found:", lat, long);
    console.log("📋 SOS Config:", config);
    console.log("👥 Contacts:", contacts.length);

    const sosState = {
      active: true,
      victimId: victimId.substring(0, 8) + "***",
      institution,
      location: { lat, long },
      timestamp: new Date().toISOString(),
      mapsLink
    };

    localStorage.setItem("active_sos", JSON.stringify(sosState));
    window.dispatchEvent(new Event("storage"));

    // 2️⃣ WhatsApp Alert (All Contacts)
    if (config.whatsappShare && contacts.length > 0) {
      console.log("📲 Triggering WhatsApp Alerts...");
      const message = encodeURIComponent(
        `🚨 EMERGENCY ALERT 🚨\nI am in danger. Please help immediately!\n\n📍 Live Location:\n${mapsLink}\n\nSent via Safety SOS System`
      );

      contacts.forEach((contact) => {
        const url = `https://wa.me/${contact.phone}?text=${message}`;
        const win = window.open(url, "_blank");
        if (!win) {
          console.warn("⚠️ WhatsApp popup blocked for contact:", contact.name);
        }
      });
    }

    // 3️⃣ Start 30-sec Live Tracking Loop (DASHBOARD ONLY)
    startLiveTracking(institution, config);

    // 4️⃣ Start Audio Recording (if enabled)
    if (config.autoAudio) {
      startAudioRecording();
    }
  });
};

const startLiveTracking = (institution: string, config: SafetyConfig) => {
  if (trackingInterval) return;

  trackingInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const long = position.coords.longitude;
      const mapsLink = `https://maps.google.com/?q=${lat},${long}`;

      console.log("📡 Updating Live Location Broadcast...");
      const sos = JSON.parse(localStorage.getItem("active_sos") || "{}");
      if (sos.active) {
        sos.location = { lat, long };
        sos.mapsLink = mapsLink;
        localStorage.setItem("active_sos", JSON.stringify(sos));
        window.dispatchEvent(new Event("storage"));
      }
    });
  }, 30000);
};

const startAudioRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("🎙️ Audio recording started (SOS Mode)");
    // You can integrate MediaRecorder here for saving audio
  } catch (error) {
    console.error("Microphone permission denied");
  }
};

export const stopSOS = () => {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  localStorage.removeItem("active_sos");
  window.dispatchEvent(new Event("storage"));
  console.log("🛑 SOS Stopped");
};
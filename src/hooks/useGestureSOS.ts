import { useEffect } from "react";
import { startSOS } from "@/services/sosEngine";

export const useGestureSOS = () => {
  useEffect(() => {
    let lastX = 0,
      lastY = 0,
      lastZ = 0;
    let shakeThreshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const deltaX = Math.abs(acc.x! - lastX);
      const deltaY = Math.abs(acc.y! - lastY);
      const deltaZ = Math.abs(acc.z! - lastZ);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        console.log("Shake Gesture Detected!");
        startSOS(); // 🔥 TRIGGERS ALL ALERTS
      }

      lastX = acc.x || 0;
      lastY = acc.y || 0;
      lastZ = acc.z || 0;
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);
};
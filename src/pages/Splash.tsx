import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === "institution") {
            navigate("/institution-dashboard");
            return;
          }
          if (user.role === "authority") {
            navigate("/authority-dashboard");
            return;
          }
          navigate("/dashboard");
          return;
        } catch (e) {
          console.error("Auth parsing error", e);
        }
      }
      navigate("/welcome");
    };

    const timer = setTimeout(checkAuth, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-hero">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur-sm"
        >
          <Shield className="h-16 w-16 text-primary-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-bold text-primary-foreground">SafeVoice</h1>
          <p className="mt-2 text-sm text-primary-foreground/60">Centralized Safety System</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8"
        >
          <div className="h-1 w-20 overflow-hidden rounded-full bg-primary-foreground/20">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/2 rounded-full bg-primary-foreground/60"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Splash;

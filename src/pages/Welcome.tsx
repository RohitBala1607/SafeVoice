import { motion } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Shield, text: "POSH Act 2013 Compliant" },
    { icon: Lock, text: "End-to-End Encrypted" },
    { icon: Eye, text: "Anonymous & Confidential" },
  ];

  return (
    <div className="flex min-h-screen flex-col gradient-hero">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur-sm"
        >
          <Shield className="h-12 w-12 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-center text-2xl font-bold text-primary-foreground"
        >
          Your Safety, Our Priority
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 max-w-xs text-center text-sm text-primary-foreground/70 leading-relaxed"
        >
          A secure, anonymous platform to report workplace harassment with full legal compliance and emergency support.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 space-y-3 w-full max-w-xs"
        >
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 px-4 py-3 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-primary-foreground/80" />
              <span className="text-sm text-primary-foreground/90">{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="px-6 pb-10">
        <Button
          onClick={() => navigate("/permissions")}
          className="w-full rounded-xl bg-primary-foreground py-6 text-sm font-semibold text-primary hover:bg-primary-foreground/90"
        >
          Get Started
        </Button>
        <p className="mt-4 text-center text-[10px] text-primary-foreground/40">
          By continuing, you agree to our Privacy Policy & POSH Act compliance terms.
        </p>
      </div>
    </div>
  );
};

export default Welcome;

import { motion } from "framer-motion";
import { User, Shield, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const roles = [
  {
    key: "user",
    icon: User,
    title: "User (Victim)",
    description: "File complaints, track cases, and access emergency SOS features",
    path: "/login",
  },
  {
    key: "authority",
    icon: Shield,
    title: "POSH / IC Member",
    description: "Access institutional dashboard to review complaints and manage POSH compliance",
    path: "/authority-login",
  },
  {
    key: "institution",
    icon: Building2,
    title: "Institution",
    description: "Manage organizational POSH compliance and internal committee",
    path: "/institution-login",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader subtitle="Select your role" />

      <div className="flex-1 px-4 py-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Who are you?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select your role to continue securely</p>

        <div className="mt-6 space-y-3">
          {roles.map(({ key, icon: Icon, title, description, path }, i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(path, { state: { role: key } })}
              className="flex w-full items-start gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-card transition-all hover:shadow-elevated"
            >
              <div className="rounded-lg bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  variant?: "default" | "emergency" | "safety" | "shield";
  badge?: string;
}

const variantStyles = {
  default: "gradient-card shadow-card hover:shadow-elevated border border-border",
  emergency: "bg-emergency/5 border border-emergency/20 hover:border-emergency/40 shadow-card hover:shadow-emergency",
  safety: "bg-safety/5 border border-safety/20 hover:border-safety/40 shadow-card",
  shield: "bg-accent border border-secondary/20 hover:border-secondary/40 shadow-card",
};

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  emergency: "bg-emergency/10 text-emergency",
  safety: "bg-safety/10 text-safety",
  shield: "bg-secondary/10 text-secondary",
};

const DashboardCard = ({ icon: Icon, title, description, onClick, variant = "default", badge }: DashboardCardProps) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full rounded-lg p-4 text-left transition-all duration-200 ${variantStyles[variant]}`}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-emergency px-2 py-0.5 text-[10px] font-semibold text-emergency-foreground">
          {badge}
        </span>
      )}
      <div className={`mb-3 inline-flex rounded-lg p-2.5 ${iconVariantStyles[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
};

export default DashboardCard;

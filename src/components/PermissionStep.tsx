import { motion } from "framer-motion";
import { LucideIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  granted: boolean;
  onGrant: () => void;
}

const PermissionStep = ({ icon: Icon, title, description, granted, onGrant }: PermissionStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 transition-all duration-300 ${
        granted ? "border-safety/40 bg-safety/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${granted ? "bg-safety/10 text-safety" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <Button
          size="sm"
          onClick={onGrant}
          disabled={granted}
          className={granted ? "bg-safety text-safety-foreground" : "gradient-primary text-primary-foreground"}
        >
          {granted ? <Check className="h-4 w-4" /> : "Allow"}
        </Button>
      </div>
    </motion.div>
  );
};

export default PermissionStep;

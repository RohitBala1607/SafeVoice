import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const AppHeader = ({ title = "SafeVoice", subtitle, showBack, onBack }: AppHeaderProps) => {
  return (
    <header className="gradient-primary px-4 pb-4 pt-safe-top">
      <div className="flex items-center gap-3 pt-4">
        {showBack && (
          <button onClick={onBack} className="rounded-lg p-1 text-primary-foreground/80 hover:text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary-foreground" />
          <div>
            <h1 className="font-display text-lg font-bold text-primary-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-primary-foreground/70">{subtitle}</p>}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default AppHeader;

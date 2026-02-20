import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";

interface CaseCardProps {
  caseId: string;
  date: string;
  status: "submitted" | "under_review" | "verified" | "closed";
  priority: "low" | "medium" | "high" | "emergency";
  institution: string;
  onClick?: () => void;
}

const statusLabels = {
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  closed: "Closed",
};

const statusStyles = {
  submitted: "bg-primary/10 text-primary",
  under_review: "bg-warning/10 text-warning",
  verified: "bg-safety/10 text-safety",
  closed: "bg-muted text-muted-foreground",
};

const priorityStyles = {
  low: "bg-safety/10 text-safety",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/10 text-warning",
  emergency: "bg-emergency/10 text-emergency",
};

const CaseCard = ({ caseId, date, status, priority, institution, onClick }: CaseCardProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-4 text-left shadow-card transition-all hover:shadow-elevated"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-foreground">{caseId}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{institution}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityStyles[priority]}`}>
          {priority}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{date}</span>
      </div>
    </motion.button>
  );
};

export default CaseCard;

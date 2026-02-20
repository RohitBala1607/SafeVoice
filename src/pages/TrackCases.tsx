import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import CaseCard from "@/components/CaseCard";
import BottomNav from "@/components/BottomNav";

import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";

const TrackCases = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaints();
  const { user } = useAuth();

  // Filter for the current institution
  const institution = user?.institution || localStorage.getItem("user_institution") || "Delhi University";
  const userCases = complaints.filter(c => c.institution === institution);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader title="My Cases" subtitle="Track your complaints" showBack onBack={() => navigate("/dashboard")} />

      <div className="flex-1 px-4 py-4">
        <div className="mb-4 flex gap-2">
          {["All", "Active", "Closed"].map((f) => (
            <button
              key={f}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${f === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {userCases.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <CaseCard
                caseId={c.id}
                date={c.date}
                status={c.status}
                priority={c.priority}
                institution={c.institution}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TrackCases;

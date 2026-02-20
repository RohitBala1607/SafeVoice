import { motion } from "framer-motion";
import {
  FileText, Search, BarChart3, Download, Settings, Phone, User, Shield,
  AlertTriangle, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
import { useComplaints } from "@/context/ComplaintContext";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { complaints } = useComplaints();
  const { user } = useAuth();
  const institution = user?.institution || localStorage.getItem("user_institution") || "Your Institution";

  const caseCount = complaints.filter(c => c.institution === institution).length;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <AppHeader subtitle={`${institution} - Your Safe Space`} />


      {/* Alert Banner */}

      {/* Alert Banner */}
      <div className="px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs text-foreground">Configure your <span className="font-semibold">SOS Safety Settings</span> for emergency protection</p>
        </motion.div>
      </div>

      {/* Identity Badge */}
      <div className="mt-3 px-4">
        <div className="flex items-center justify-between rounded-xl bg-card p-4 border border-border shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-safety/10 p-2">
              <Shield className="h-5 w-5 text-safety" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Secure Identity</p>
              <p className="font-display text-lg font-bold text-foreground">
                {user?.victimId || (user?.id ? `SV-${Math.floor(100000 + Math.random() * 900000)}` : "SV-LOADING")}
              </p>
            </div>
          </div>
          <div className="rounded-full bg-safety/5 px-2 py-1">
            <span className="text-[10px] font-bold text-safety tracking-tight">VERIFIED ID</span>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-4 pt-5">
        <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard
            icon={FileText}
            title="File Complaint"
            description="Submit a new POSH complaint securely"
            variant="shield"
            onClick={() => navigate("/file-complaint")}
          />
          <DashboardCard
            icon={Shield}
            title="POSH Modules"
            description="Legal info & category guidance"
            variant="safety"
            onClick={() => navigate("/modules")}
          />
          <DashboardCard
            icon={Search}
            title="Track Cases"
            description={caseCount > 0 ? `You have ${caseCount} active cases` : "View status of your complaints"}
            onClick={() => navigate("/cases")}
          />
          <DashboardCard
            icon={BarChart3}
            title="Institution Report"
            description="View transparency dashboard"
            onClick={() => navigate("/institution-transparency")}
          />
          <DashboardCard
            icon={Download}
            title="Legal Reports"
            description="Download government-format PDFs"
            onClick={() => navigate("/cases")}
          />
        </div>
      </div>

      {/* Safety & Profile */}
      <div className="px-4 pt-5">
        <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Safety & Profile</h3>
        <div className="grid grid-cols-2 gap-3">
          <DashboardCard
            icon={Settings}
            title="Safety Settings"
            description="SOS customization & stealth mode"
            variant="emergency"
            onClick={() => navigate("/safety-settings")}
          />
          <DashboardCard
            icon={User}
            title="Profile"
            description="Anonymous identity settings"
            onClick={() => navigate("/profile")}
          />
          <DashboardCard
            icon={TrendingUp}
            title="AI Insights"
            description="Sentiment analysis & risk"
            variant="safety"
            onClick={() => navigate("/cases")}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;

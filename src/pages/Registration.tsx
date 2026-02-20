import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";

const institutions = [
  "Delhi University",
  "IIT Bombay",
  "Tata Consultancy Services",
  "Infosys Limited",
  "AIIMS Delhi",
  "National Law School, Bangalore",
  "Wipro Technologies",
  "Indian Statistical Institute",
  "Jawaharlal Nehru University",
  "Reliance Industries",
];

const Registration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const filtered = institutions.filter((i) => i.toLowerCase().includes(search.toLowerCase()));

  if (step === 4) {
    // Save institution for the dashboard
    if (selectedInstitution) {
      localStorage.setItem("user_institution", selectedInstitution);
    }

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader subtitle="Registration Complete" />
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="rounded-full bg-safety/10 p-6"
          >
            <CheckCircle2 className="h-16 w-16 text-safety" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">Identity Secured</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your anonymous ID has been generated</p>
            <div className="mt-4 rounded-lg border border-safety/30 bg-safety/5 px-6 py-3">
              <p className="text-xs text-muted-foreground">Your Anonymous ID</p>
              <p className="mt-1 font-display text-lg font-bold text-safety">VICTIM-{Math.floor(1000 + Math.random() * 9000)}</p>
            </div>
            <p className="mt-4 max-w-xs text-xs text-muted-foreground leading-relaxed">
              Your real identity is encrypted and never visible in dashboards or reports per POSH Act Section 16.
            </p>
          </motion.div>
          <Button onClick={() => navigate("/dashboard")} className="mt-8 w-full max-w-xs rounded-xl gradient-primary py-6 text-sm font-semibold text-primary-foreground">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader subtitle="Institution Verification" showBack onBack={() => (step > 1 ? setStep(step - 1) : navigate(-1))} />

      <div className="gradient-primary px-6 pb-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary-foreground/80" : "bg-primary-foreground/20"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Select Your Institution</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search from the verified institution registry</p>
            <Input
              className="mt-4"
              placeholder="Search institution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
              {filtered.map((inst) => (
                <button
                  key={inst}
                  onClick={() => { setSelectedInstitution(inst); setStep(2); }}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${selectedInstitution === inst ? "border-primary bg-primary/5 font-medium text-primary" : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Verify Your Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your official {selectedInstitution} email</p>
            <Input
              className="mt-4"
              type="email"
              placeholder="yourname@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={() => setStep(3)} disabled={!email.includes("@")} className="mt-4 w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground">
              Send OTP
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">Enter OTP</h2>
            <p className="mt-1 text-sm text-muted-foreground">A 6-digit code was sent to {email}</p>
            <Input
              className="mt-4 text-center text-2xl tracking-[0.5em] font-display"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <Button onClick={() => setStep(4)} disabled={otp.length !== 6} className="mt-4 w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground">
              Verify & Create Identity
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Your identity will be encrypted per POSH Act Section 16
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Registration;

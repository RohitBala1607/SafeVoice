import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, User, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/AppHeader";

const InstitutionRegister = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const [formData, setFormData] = useState({
        orgName: "",
        orgType: "",
        adminName: "",
        adminEmail: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    // 🔥 BACKEND CONNECTED REGISTER FUNCTION (MongoDB + API)
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await fetch("http://localhost:5000/api/institutions/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orgName: formData.orgName,
                    orgType: formData.orgType,
                    adminName: formData.adminName,
                    adminEmail: formData.adminEmail,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Save orgId from backend (recommended)
            if (data.orgId) {
                setOrgId(data.orgId);
            }

            // Move to success step ONLY after DB save
            setStep(4);

        } catch (err: any) {
            console.error("Registration Error:", err);
            setError(err.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ SUCCESS SCREEN (After MongoDB Save)
    if (step === 4) {
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

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 text-center"
                    >
                        <h2 className="font-display text-xl font-bold text-foreground">
                            Organization Registered
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Your institution has been successfully enrolled in the SafetyNet Pro network.
                        </p>

                        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-left">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Organization ID
                            </p>
                            <p className="mt-1 font-display text-lg font-bold text-primary">
                                {orgId || "Generating..."}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Please keep this ID for technical support and verification.
                            </p>
                        </div>
                    </motion.div>

                    <Button
                        onClick={() => navigate("/institution-login")}
                        className="mt-8 w-full max-w-xs rounded-xl gradient-primary py-6 text-sm font-semibold text-primary-foreground"
                    >
                        Proceed to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AppHeader
                subtitle="Institution Enrollment"
                showBack
                onBack={() => (step > 1 ? prevStep() : navigate("/institution-login"))}
            />

            {/* Progress Bar */}
            <div className="gradient-primary px-6 pb-4">
                <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full ${
                                s <= step ? "bg-primary-foreground/80" : "bg-primary-foreground/20"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 px-4 py-8 overflow-y-auto">
                {/* STEP 1: Organization Details */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="font-display text-lg font-semibold text-foreground">
                            Organization Details
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Tell us about your institution
                        </p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-foreground">
                                    Organization Name
                                </label>
                                <Input
                                    name="orgName"
                                    placeholder="e.g. Delhi University"
                                    value={formData.orgName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-foreground">
                                    Organization Type
                                </label>
                                <Input
                                    name="orgType"
                                    placeholder="e.g. University, Corporate, Government"
                                    value={formData.orgType}
                                    onChange={handleChange}
                                />
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={!formData.orgName || !formData.orgType}
                                className="mt-4 w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
                            >
                                Next Step
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: Admin Contact */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
                            <User className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="font-display text-lg font-semibold text-foreground">
                            Admin Contact
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Official representative for POSH compliance
                        </p>

                        <div className="mt-6 space-y-4">
                            <Input
                                name="adminName"
                                placeholder="Admin Name"
                                value={formData.adminName}
                                onChange={handleChange}
                            />

                            <Input
                                name="adminEmail"
                                type="email"
                                placeholder="admin@institution.edu"
                                value={formData.adminEmail}
                                onChange={handleChange}
                            />

                            <Button
                                onClick={nextStep}
                                disabled={!formData.adminName || !formData.adminEmail}
                                className="mt-4 w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
                            >
                                Next Step
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: Security + API Register */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2">
                            <KeyRound className="h-5 w-5 text-primary" />
                        </div>

                        <h2 className="font-display text-lg font-semibold text-foreground">
                            Security
                        </h2>

                        <div className="mt-6 space-y-4">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />

                            {error && (
                                <p className="text-sm text-red-500 font-medium">{error}</p>
                            )}

                            <Button
                                onClick={handleRegister}
                                disabled={
                                    loading ||
                                    !formData.password ||
                                    formData.password !== formData.confirmPassword
                                }
                                className="mt-4 w-full rounded-xl gradient-primary py-5 text-sm font-semibold text-primary-foreground"
                            >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {loading ? "Registering..." : "Register Organization"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="px-6 py-4 text-center border-t border-border bg-card">
                <p className="text-xs text-muted-foreground">
                    Already registered?{" "}
                    <Link to="/institution-login" className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default InstitutionRegister;
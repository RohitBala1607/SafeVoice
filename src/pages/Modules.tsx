import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ModuleCard from "@/components/ModuleCard";
import { HARASSMENT_MODULES } from "@/data/harassment-modules";
import { motion } from "framer-motion";

const Modules = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-background pb-20">
            <AppHeader title="POSH Modules" subtitle="Legal Definitions & Rights" showBack onBack={() => navigate("/dashboard")} />

            <div className="flex-1 px-4 py-6">
                <div className="mb-6 rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <h2 className="text-sm font-semibold text-primary">Know Your Rights</h2>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Each category below represents a distinct type of harassment defined under the POSH Act. Understanding these "Modules" helps in filing accurate complaints.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {HARASSMENT_MODULES.map((module, i) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <ModuleCard
                                module={module}
                                onClick={() => navigate("/file-complaint", { state: { selectedType: module.name } })}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Modules;

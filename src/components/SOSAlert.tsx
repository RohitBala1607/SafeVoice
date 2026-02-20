import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOSAlert = ({ institution }: { institution: string }) => {
    const [activeSOS, setActiveSOS] = useState<any>(null);

    const checkSOS = () => {
        const sos = localStorage.getItem("active_sos");
        if (sos) {
            const parsed = JSON.parse(sos);
            if (parsed.institution === institution && parsed.active) {
                setActiveSOS(parsed);
                return;
            }
        }
        setActiveSOS(null);
    };

    useEffect(() => {
        checkSOS();
        window.addEventListener("storage", checkSOS);
        const interval = setInterval(checkSOS, 5000); // Polling fallback
        return () => {
            window.removeEventListener("storage", checkSOS);
            clearInterval(interval);
        };
    }, [institution]);

    if (!activeSOS) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-x-4 top-4 z-50 rounded-2xl border-2 border-emergency bg-red-600 p-4 shadow-elevated"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 animate-pulse">
                        <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="flex items-center gap-2 font-display text-base font-black text-white">
                            🚨 ACTIVE SOS ALERT
                        </h2>
                        <p className="mt-1 text-sm font-medium text-white/90">
                            User ID: <span className="font-mono">{activeSOS.victimId}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white text-red-600 hover:bg-white/90"
                                onClick={() => window.open(activeSOS.mapsLink, "_blank")}
                            >
                                <MapPin className="mr-1 h-3 w-3" /> Track Location
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                                onClick={() => {
                                    localStorage.removeItem("active_sos");
                                    window.dispatchEvent(new Event("storage"));
                                }}
                            >
                                <XCircle className="mr-1 h-3 w-3" /> Mark Resolved
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SOSAlert;

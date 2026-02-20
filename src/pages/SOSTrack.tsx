import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Shield, AlertCircle, Clock } from "lucide-react";
import api from "@/services/api";

const SOSTrack = () => {
    const { publicId } = useParams();
    const [session, setSession] = useState<any>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchSession = async () => {
        try {
            const response = await api.get(`/sos/track/${publicId}`);
            setSession(response.data);
            setError(false);
        } catch (err) {
            console.error("SOS Track Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
        const interval = setInterval(fetchSession, 10000); // 10s poll
        return () => clearInterval(interval);
    }, [publicId]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <Shield className="h-12 w-12 animate-pulse text-emergency" />
                <p className="mt-4 text-sm font-medium">Connecting to Live SOS Feed...</p>
            </div>
        );
    }

    if (error || session?.status === 'resolved') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
                <div className="rounded-full bg-safety/10 p-4">
                    <Shield className="h-12 w-12 text-safety" />
                </div>
                <h2 className="text-xl font-bold">SafeVoice Protection Active</h2>
                <p className="text-sm text-muted-foreground">
                    This SOS session has been safely resolved or is no longer available.
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="bg-emergency/10 px-6 py-8 text-center border-b border-emergency/20">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emergency shadow-lg animate-pulse">
                    <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">EMERGENCY ALERT</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-emergency mt-1">Live Location Tracking Active</p>
            </div>

            <div className="flex-1 p-6 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                            <Phone className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Identity Protected</p>
                            <p className="text-lg font-bold">Victim SV-{session.victimId.split('-')[1] || '******'}</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-safety" />
                            <p className="text-xs font-medium">{session.institution} Security Alerted</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Last updated: {new Date(session.updated_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Coordinates</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Latitude</p>
                            <p className="font-mono text-sm font-bold">{session.location.lat.toFixed(6)}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Longitude</p>
                            <p className="font-mono text-sm font-bold">{session.location.lng.toFixed(6)}</p>
                        </div>
                    </div>
                </div>

                <a
                    href={session.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-foreground py-5 text-sm font-bold text-background shadow-lg transition-transform active:scale-95"
                >
                    <MapPin className="h-5 w-5" />
                    OPEN IN GOOGLE MAPS
                </a>
            </div>

            <div className="p-6 border-t border-border bg-muted/20">
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    SafeVoice generates a temporary tracking link for emergency verification. Accuracy depends on the victim's device signal.
                </p>
            </div>
        </div>
    );
};

export default SOSTrack;

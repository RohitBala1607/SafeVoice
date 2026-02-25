import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintContext";
import api from "@/services/api";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CaseReport = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { complaints } = useComplaints();

    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || id === "undefined" || id === "null") {
            setError("No ID parameter provided or invalid ID format.");
            setLoading(false);
            return;
        }

        // 1️⃣ Try finding in context first
        const existingCase = complaints?.find(
            (c: any) =>
                c.caseId === id ||
                c.complaintId === id ||
                c._id === id
        );

        if (existingCase) {
            setCaseData(existingCase);
            setLoading(false);
            return;
        }

        // 2️⃣ Fetch from backend if not found in context
        const fetchCase = async () => {
            try {
                const res = await api.get(`/complaints/${id}`);
                setCaseData(res.data);
            } catch (err: any) {
                console.error("Error fetching case:", err);
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to fetch case"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCase();
    }, [id, complaints]);

    // 🔥 Safe Reference ID (prevents undefined literal)
    const candidates = [caseData?.caseId, caseData?.complaintId, caseData?._id, id];
    const referenceId = candidates.find(val => val && String(val).trim() !== "undefined") || "N/A";

    const timestamp = new Date().toLocaleString();

    const incidentDate =
        caseData?.created_at
            ? new Date(caseData.created_at).toLocaleString()
            : caseData?.createdAt
                ? new Date(caseData.createdAt).toLocaleString()
                : caseData?.date
                    ? new Date(caseData.date).toLocaleString()
                    : "Date Not Specified";

    const evidenceList =
        caseData?.evidence &&
            Array.isArray(caseData.evidence) &&
            caseData.evidence.length > 0
            ? caseData.evidence.map((e: any, index: number) => (
                <li key={index}>
                    {(e.fileType || "DOCUMENT").toUpperCase()} :{" "}
                    {e.name || "Attached File"}
                </li>
            ))
            : null;

    const audioStatus = caseData?.hasAudio ? "Yes" : "No";
    const sosStatus = caseData?.hasSOS ? "Yes" : "No";

    // 🔄 Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                    Loading certified legal report...
                </p>
            </div>
        );
    }

    // ❌ Error State
    if (error || !caseData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <p className="text-muted-foreground">
                    Case not found or access denied.
                </p>
                <Button
                    onClick={() => navigate(-1)}
                    className="mt-4"
                >
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Controls */}
            <div className="no-print sticky top-0 bg-background/80 backdrop-blur-md border-b p-4 flex items-center justify-between z-10 shadow-sm">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>

                <Button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-primary"
                >
                    <Download className="h-4 w-4" />
                    Save as PDF / Print
                </Button>
            </div>

            {/* Report Content */}
            <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
                <div className="text-center border-b-2 border-primary pb-6 mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        LEGAL COMPLAINT REPORT
                    </h1>
                    <p className="text-sm text-gray-600">
                        Under POSH Act, 2013
                    </p>
                </div>

                {/* Case Info */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary border-b pb-2 mb-4">
                        Case Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Reference ID
                            </span>
                            <span className="font-medium">{referenceId}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Institution
                            </span>
                            <span className="font-medium">{caseData?.institution || "Unknown"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Filing Date
                            </span>
                            <span className="font-medium">{incidentDate}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Status
                            </span>
                            <span className="font-medium">{caseData?.status?.toUpperCase() || "PENDING"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Priority Level
                            </span>
                            <span className="font-medium">{caseData?.priority?.toUpperCase() || "MEDIUM"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Report Generated
                            </span>
                            <span className="font-medium">{timestamp}</span>
                        </div>
                    </div>
                </div>

                {/* Complainant Details */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary border-b pb-2 mb-4">
                        Complainant Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Victim Anonymous ID
                            </span>
                            <span className="font-medium">{caseData?.victimId || "SV-ANONYMOUS"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Organization
                            </span>
                            <span className="font-medium">{caseData?.institution || "SafeVoice Registry"}</span>
                        </div>
                    </div>
                </div>

                {/* Incident Description */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary border-b pb-2 mb-4">
                        Incident Description
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">
                        {caseData?.description || "No description provided."}
                    </div>
                </div>

                {/* AI Priority Analysis */}
                {caseData?.aiAnalysis?.summary && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold uppercase text-primary border-b pb-2 mb-4">
                            AI Priority Summary
                        </h2>
                        <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary whitespace-pre-wrap">
                            {caseData.aiAnalysis.summary}
                        </div>
                    </div>
                )}

                {/* Evidence & Logs */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase text-primary border-b pb-2 mb-4">
                        Evidence & Tracking Log
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Emergency SOS Triggered
                            </span>
                            <span className="font-medium">{sosStatus}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 uppercase block mb-1">
                                Audio Surveillance Data
                            </span>
                            <span className="font-medium">{audioStatus}</span>
                        </div>
                    </div>

                    {evidenceList ? (
                        <div className="mt-4">
                            <span className="text-xs text-gray-500 uppercase block mb-2">Attached Evidence</span>
                            <ul className="list-disc pl-5 text-sm">{evidenceList}</ul>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No evidence files attached to this report.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t text-center text-xs text-gray-400">
                    <p>Generated by SafeVoice Compliance Engine</p>
                    <p>This is a digitally generated certified legal report. Protected under Section 16 of the POSH Act.</p>
                </div>
            </div>
        </div>
    );
};

export default CaseReport;
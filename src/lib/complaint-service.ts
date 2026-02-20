import { Complaint } from "../types/complaints";
import { MOCK_COMPLAINTS } from "../data/mock-cases";

const STORAGE_KEY = "safety_net_complaints";

export const complaintService = {
    getComplaints: (): Complaint[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Initialize with mock data if empty
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_COMPLAINTS));
            return MOCK_COMPLAINTS;
        }
        return JSON.parse(stored);
    },

    addComplaint: (complaint: Partial<Complaint>): Complaint => {
        const complaints = complaintService.getComplaints();
        const newComplaint: Complaint = {
            id: `POSH-2026-${String(complaints.length + 1).padStart(3, "0")}`,
            institution: localStorage.getItem("user_institution") || "Delhi University",
            priority: "medium",
            status: "submitted",
            victimId: `VICTIM-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            hasAudio: false,
            hasSOS: false,
            severity: Math.floor(Math.random() * 100),
            type: "Other",
            ...complaint,
        } as Complaint;

        const updated = [newComplaint, ...complaints];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newComplaint;
    },

    updateComplaintStatus: (id: string, status: Complaint["status"]) => {
        const complaints = complaintService.getComplaints();
        const updated = complaints.map((c) => (c.id === id ? { ...c, status } : c));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    getStats: (institution: string) => {
        const complaints = complaintService.getComplaints().filter(c => c.institution === institution);
        return {
            total: complaints.length,
            active: complaints.filter(c => c.status !== "closed").length,
            sos: complaints.filter(c => c.hasSOS).length,
            resolved: complaints.filter(c => c.status === "closed").length,
        };
    }
};

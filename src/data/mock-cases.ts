import { Complaint } from "../types/complaints";

export const MOCK_COMPLAINTS: Complaint[] = [
    {
        id: "POSH-2026-001", institution: "Delhi University", priority: "high", status: "under_review",
        victimId: "VICTIM-4821", date: "Feb 15, 2026", hasAudio: true, hasSOS: false,
        severity: 78, type: "Physical Harassment",
    },
    {
        id: "POSH-2026-004", institution: "Delhi University", priority: "medium", status: "submitted",
        victimId: "VICTIM-2231", date: "Feb 19, 2026", hasAudio: false, hasSOS: false,
        severity: 45, type: "Verbal Harassment",
    },
    {
        id: "POSH-2026-005", institution: "Delhi University", priority: "emergency", status: "under_review",
        victimId: "VICTIM-9902", date: "Feb 20, 2026", hasAudio: true, hasSOS: true,
        severity: 95, type: "Stalking",
    },
    {
        id: "POSH-2026-006", institution: "Delhi University", priority: "high", status: "submitted",
        victimId: "VICTIM-1122", date: "Feb 17, 2026", hasAudio: false, hasSOS: false,
        severity: 82, type: "Cyber Harassment",
    },
    {
        id: "POSH-2026-007", institution: "Delhi University", priority: "medium", status: "under_review",
        victimId: "VICTIM-5567", date: "Feb 16, 2026", hasAudio: false, hasSOS: false,
        severity: 60, type: "Visual Harassment",
    },
    {
        id: "POSH-2026-008", institution: "Delhi University", priority: "high", status: "submitted",
        victimId: "VICTIM-3344", date: "Feb 14, 2026", hasAudio: true, hasSOS: false,
        severity: 88, type: "Quid Pro Quo",
    },
    {
        id: "POSH-2026-002", institution: "IIT Bombay", priority: "emergency", status: "submitted",
        victimId: "VICTIM-7392", date: "Feb 18, 2026", hasAudio: true, hasSOS: true,
        severity: 92, type: "Stalking",
    },
    {
        id: "POSH-2026-003", institution: "TCS", priority: "medium", status: "submitted",
        victimId: "VICTIM-1058", date: "Feb 12, 2026", hasAudio: false, hasSOS: false,
        severity: 55, type: "Verbal Harassment",
    },
];

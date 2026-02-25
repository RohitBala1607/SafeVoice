export type HarassmentType =
    | "Verbal Harassment"
    | "Physical Harassment"
    | "Visual Harassment"
    | "Quid Pro Quo Harassment"
    | "Hostile Work Environment"
    | "Online Harassment"
    | "Stalking"
    | "Other";

export type CaseStatus = "submitted" | "under_review" | "verified" | "closed";
export type Priority = "low" | "medium" | "high" | "emergency";

export interface Complaint {
    id: string; // Internal/Local ID
    complaintId: string; // Human-readable ID from backend
    institution: string;
    priority: Priority;
    status: CaseStatus;
    victimId: string;
    date: string;
    hasAudio: boolean;
    hasSOS: boolean;
    severity: number;
    type: HarassmentType;
    description?: string;
    location?: string;
}

export interface HarassmentModule {
    id: string;
    name: HarassmentType;
    description: string;
    iconName: string;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Complaint } from "../types/complaints";
import api from "../services/api";
import { useAuth } from "./AuthContext";

interface ComplaintContextType {
    complaints: Complaint[];
    refreshComplaints: () => Promise<void>;
    addComplaint: (complaint: Partial<Complaint>) => Promise<any>;
    updateStatus: (id: string, status: Complaint["status"]) => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const { user } = useAuth();

    const refreshComplaints = useCallback(async () => {
        if (!user?.institution) return;
        try {
            const response = await api.get(`/complaints/institution/${user.institution}`);
            setComplaints(response.data);
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        }
    }, [user?.institution]);

    useEffect(() => {
        if (user) {
            refreshComplaints();
        }
    }, [user, refreshComplaints]);

    const addComplaint = async (complaintData: Partial<Complaint>) => {
        const response = await api.post('/complaints', {
            ...complaintData,
            victim_id: user?.name ? `USER-${user.name}` : `VICTIM-${Math.floor(1000 + Math.random() * 9000)}`,
            institution: user?.institution || localStorage.getItem("user_institution") || "Default Institution"
        });
        await refreshComplaints();
        return response.data;
    };

    const updateStatus = async (id: string, status: Complaint["status"]) => {
        // Assuming there's a status update endpoint, or we update the whole object
        await api.patch(`/complaints/${id}/status`, { status });
        await refreshComplaints();
    };

    return (
        <ComplaintContext.Provider value={{ complaints, refreshComplaints, addComplaint, updateStatus }}>
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaints = () => {
    const context = useContext(ComplaintContext);
    if (!context) throw new Error("useComplaints must be used within a ComplaintProvider");
    return context;
};

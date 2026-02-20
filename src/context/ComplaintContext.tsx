import React, { createContext, useContext, useState, useEffect } from "react";
import { Complaint } from "../types/complaints";
import { complaintService } from "../lib/complaint-service";

interface ComplaintContextType {
    complaints: Complaint[];
    refreshComplaints: () => void;
    addComplaint: (complaint: Partial<Complaint>) => Complaint;
    updateStatus: (id: string, status: Complaint["status"]) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);

    const refreshComplaints = () => {
        setComplaints(complaintService.getComplaints());
    };

    useEffect(() => {
        refreshComplaints();
    }, []);

    const addComplaint = (complaint: Partial<Complaint>) => {
        const newCase = complaintService.addComplaint(complaint);
        refreshComplaints();
        return newCase;
    };

    const updateStatus = (id: string, status: Complaint["status"]) => {
        complaintService.updateComplaintStatus(id, status);
        refreshComplaints();
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export interface Complaint {
    id: string;
    complaintId: string;
    caseId?: string;
    _id?: string;
    victimId: string;
    institution: string;
    type: string;
    description: string;
    location: string;
    hasAudio: boolean;
    hasSOS: boolean;
    date: string;
    status: string;
    priority: string;
    createdAt?: string;
    created_at?: string;
    aiAnalysis?: {
        summary?: string;
        [key: string]: any;
    };
    evidence?: {
        fileType: 'image' | 'audio' | 'video';
        url: string;
        name: string;
    }[];
}

interface ComplaintContextType {
    complaints: Complaint[];
    loading: boolean;
    addComplaint: (complaintData: any) => Promise<any>;
    fetchComplaints: () => Promise<void>;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    const fetchComplaints = async () => {
        if (!isAuthenticated || !user) return;

        setLoading(true);
        try {
            let endpoint = '';

            if (!user.role || user.role === 'user') {
                // Victims only see their OWN complaints using their SV-ID
                const vid = user.victimId || user.id;
                endpoint = `/complaints/victim/${vid}`;
            } else if (user.role === 'institution') {
                // Institutions see all complaints recorded for them
                endpoint = `/complaints/institution/${user.institution}`;
            } else {
                // For other roles (like authority), they might fetch differently, 
                // but for now we default to institution level if requested
                endpoint = `/complaints/institution/${user.institution}`;
            }

            const response = await api.get(endpoint);
            console.log(`FETCH_COMPLAINTS: Success for ${endpoint}`, response.data.length, "items");
            const formattedComplaints = response.data.map((c: any) => ({
                ...c,
                id: c.complaintId || c._id
            }));
            setComplaints(formattedComplaints);
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchComplaints();
        } else {
            setComplaints([]);
        }
    }, [isAuthenticated, user?.institution]);

    const addComplaint = async (complaintData: any) => {
        // Ensuring the backend receives mandatory fields even if component misses them
        const enrichedData = {
            ...complaintData,
            victim_id: complaintData.victim_id || user?.victimId || user?.id,
            institution: complaintData.institution || user?.institution,
        };

        const response = await api.post('/complaints', enrichedData);

        // Refresh complaints after adding
        fetchComplaints();

        // Map backend complaintId to frontend 'id' for consistency with what UI expects
        return {
            ...response.data,
            id: response.data.complaintId || response.data._id
        };
    };

    return (
        <ComplaintContext.Provider value={{ complaints, loading, addComplaint, fetchComplaints }}>
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaints = () => {
    const context = useContext(ComplaintContext);
    if (context === undefined) {
        throw new Error('useComplaints must be used within a ComplaintProvider');
    }
    return context;
};
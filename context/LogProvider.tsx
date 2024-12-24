"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface LogContextProps {
    unreadLogsCount: number;
    fetchUnreadLogs: () => Promise<void>;
}

const LogContext = createContext<LogContextProps | undefined>(undefined);

export const LogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [unreadLogsCount, setUnreadLogsCount] = useState(0);

    const fetchUnreadLogs = async () => {
        try {
            const response = await fetch("/api/logs");
            if (response.ok) {
                const { logs } = await response.json();
                const unreadCount = logs.filter((log: any) => !log.is_read && !log.is_archived).length;
                setUnreadLogsCount(unreadCount);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    useEffect(() => {
        fetchUnreadLogs(); // Fetch logs on app startup
        const interval = setInterval(fetchUnreadLogs, 60000); // Optional: Poll every 60 seconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    return (
        <LogContext.Provider value={{ unreadLogsCount, fetchUnreadLogs }}>
            {children}
        </LogContext.Provider>
    );
};

export const useLogContext = () => {
    const context = useContext(LogContext);
    if (!context) {
        throw new Error("useLogContext must be used within a LogProvider");
    }
    return context;
};

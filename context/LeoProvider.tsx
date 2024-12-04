"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
    id: string;
    sender: "user" | "bot";
    content: string;
    timestamp: Date;
}

interface LeoContextType {
    messages: ChatMessage[];
    addMessage: (message: ChatMessage) => void;
    clearMessages: () => void;
}

const LeoContext = createContext<LeoContextType | undefined>(undefined);

export const useLeoContext = () => {
    const context = useContext(LeoContext);
    if (!context) {
        throw new Error("useLeoContext must be used within a ChatProvider");
    }
    return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const addMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return (
        <LeoContext.Provider value={{ messages, addMessage, clearMessages }}>
            {children}
        </LeoContext.Provider>
    );
};

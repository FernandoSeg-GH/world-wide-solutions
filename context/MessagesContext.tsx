"use client";

import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { InboxMessage, ConversationSummary, UserWithClaims } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface MessagesContextProps {
    conversations: ConversationSummary[];
    messages: InboxMessage[];
    loading: boolean;
    totalUnread: number;
    fetchConversations: () => Promise<ConversationSummary[]>;
    fetchMessages: (conversationId: number) => Promise<void>;
    replyToMessage: (originalMessageId: number, content: string) => Promise<void>;
    sendMessageToUsers: (
        recipientIds: number[],
        content: string,
        readOnly: boolean,
        accidentClaimId: string
    ) => Promise<void>;
    markAsRead: (messageId: number) => Promise<void>;
    fetchInboxMessages: () => Promise<void>;
    fetchUsersWithClaims: () => Promise<UserWithClaims[] | null>;
    markMessagesAsRead: (conversationId: number) => Promise<void>;
    markAllMessagesAsRead: () => Promise<void>;
    setConversations: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;
    setMessages: React.Dispatch<React.SetStateAction<InboxMessage[]>>;
    sendMessage: (conversationId: number, content: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Derive totalUnread from conversations
    const totalUnread = useMemo(() => {
        return conversations.reduce((acc, convo) => acc + (convo.unreadCount || 0), 0);
    }, [conversations]);

    // Fetch all conversations
    const fetchConversations = useCallback(async (): Promise<ConversationSummary[]> => {
        if (!session?.accessToken) return [];

        setLoading(true);
        try {
            const response = await fetch("/api/messages/conversations", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch conversations");

            const data: ConversationSummary[] = await response.json();
            setConversations(data);

            return data;
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Fetch messages for a specific conversation
    const fetchMessages = useCallback(
        async (conversationId: number): Promise<void> => {
            if (!session?.accessToken) return;
            setLoading(true);

            try {
                const response = await fetch(`/api/messages/conversations/${conversationId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch messages");

                const data: InboxMessage[] = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        },
        [session]
    );

    // Reply to a message
    const replyToMessage = useCallback(
        async (originalMessageId: number, content: string): Promise<void> => {
            if (!session?.accessToken) throw new Error("Unauthorized");

            const response = await fetch("/api/messages/reply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    message_id: originalMessageId,
                    content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send reply");
            }

            // Optionally, refetch messages to update state
            await fetchMessages(originalMessageId); // Assuming originalMessageId maps to conversationId
        },
        [session, fetchMessages]
    );

    // Send a message to multiple users
    const sendMessageToUsers = useCallback(
        async (
            recipientIds: number[],
            content: string,
            readOnly: boolean,
            accidentClaimId: string
        ): Promise<void> => {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    recipient_ids: recipientIds,
                    content,
                    read_only: readOnly,
                    accident_claim_id: accidentClaimId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send message");
            }

            // Optionally, refetch conversations to update state
            await fetchConversations();
        },
        [session, fetchConversations]
    );

    // Send a message to a specific conversation
    const sendMessage = useCallback(
        async (conversationId: number, content: string): Promise<void> => {
            const response = await fetch(`/api/messages/conversations/${conversationId}/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    content,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send message");
            }

            // Optionally, refetch messages to update state
            await fetchMessages(conversationId);
        },
        [session, fetchMessages]
    );

    // Mark a single message as read
    const markAsRead = useCallback(
        async (messageId: number): Promise<void> => {
            const response = await fetch("/api/messages/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ message_id: messageId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to mark message as read");
            }
        },
        [session]
    );


    // Fetch inbox messages
    const fetchInboxMessages = useCallback(async (): Promise<void> => {
        if (!session?.accessToken) return;
        setLoading(true);

        try {
            const response = await fetch("/api/messages/inbox", {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch inbox messages");
            }

            const data: InboxMessage[] = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching inbox messages:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Fetch users with claims
    const fetchUsersWithClaims = useCallback(async (): Promise<UserWithClaims[] | null> => {
        if (!session?.accessToken) return null;
        setLoading(true);

        try {
            const response = await fetch("/api/messages/users_claims", {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch users with claims");
            }

            const data: UserWithClaims[] = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching users with claims:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [session]);

    // Mark all messages in a conversation as read
    const markMessagesAsRead = useCallback(
        async (conversationId: number): Promise<void> => {
            if (!session?.accessToken) return;

            const unreadMessages = messages.filter((msg) => !msg.read);

            try {
                await Promise.all(
                    unreadMessages.map(async (msg) => {
                        const res = await fetch("/api/messages/read", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${session.accessToken}`,
                            },
                            body: JSON.stringify({ message_id: msg.messageId }),
                        });

                        if (!res.ok) throw new Error("Failed to mark message as read");
                    })
                );

                setConversations((prev) =>
                    prev.map((convo) =>
                        convo.conversationId === conversationId
                            ? { ...convo, unreadCount: 0 }
                            : convo
                    )
                );
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        },
        [messages, session, setConversations]
    );


    // Mark all messages as read across all conversations
    const markAllMessagesAsRead = useCallback(async (): Promise<void> => {
        if (!session?.accessToken) return;

        setLoading(true);
        try {
            // Fetch all conversations
            const conversations = await fetchConversations();

            // Iterate through each conversation and mark unread messages as read
            await Promise.all(
                conversations.map(async (convo) => {
                    if (convo.unreadCount > 0) {
                        await markMessagesAsRead(Number(convo.conversationId));
                    }
                })
            );
        } catch (error) {
            console.error("Error marking all messages as read:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchConversations, markMessagesAsRead, session]);

    // Polling for real-time updates
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         fetchConversations();
    //     }, 60000); // Fetch every 60 seconds

    //     return () => clearInterval(interval);
    // }, [fetchConversations]);

    return (
        <MessagesContext.Provider value={{
            conversations,
            messages,
            loading,
            totalUnread,
            fetchConversations,
            fetchMessages,
            replyToMessage,
            sendMessageToUsers,
            sendMessage,
            markAsRead,
            fetchInboxMessages,
            fetchUsersWithClaims,
            markMessagesAsRead,
            markAllMessagesAsRead,
            setConversations,
            setMessages,
        }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessagesContext = () => {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error("useMessagesContext must be used within a MessagesProvider");
    }
    return context;
};

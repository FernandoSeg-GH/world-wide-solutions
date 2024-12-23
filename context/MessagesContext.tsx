"use client"
import React, { createContext, useState, useContext, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { InboxMessage, ConversationSummary, UserWithClaims } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface MessagesContextProps {
    conversations: ConversationSummary[];
    messages: InboxMessage[];
    loading: boolean;
    totalUnread: number;
    fetchConversations: () => Promise<ConversationSummary[]>;
    fetchMessages: (accidentClaimId: string, page?: number) => Promise<void>;
    replyToMessage: (accidentClaimId: string, messageId: number, content: string) => Promise<void>;
    sendMessageToUsers: (
        recipientIds: number[],
        content: string,
        accidentClaimId: string
    ) => Promise<void>;
    markAsRead: (accidentClaimId: string, messageId: number) => Promise<void>;
    fetchInboxMessages: () => Promise<void>;
    fetchUsersWithClaims: () => Promise<UserWithClaims[] | null>;
    markMessagesAsRead: (accidentClaimId: string) => Promise<void>;
    markAllMessagesAsRead: () => Promise<void>;
    setConversations: React.Dispatch<React.SetStateAction<ConversationSummary[]>>;
    setMessages: React.Dispatch<React.SetStateAction<InboxMessage[]>>;
    sendMessage: (accidentClaimId: string, content: string) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

const apiRequest = async (url: string, options: RequestInit) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "API request failed.");
        }
        return await response.json();
    } catch (error: any) {
        console.error(`Error with request to ${url}:`, error.message);
        throw error;
    }
};

const areConversationsEqual = (prev: ConversationSummary[], newData: ConversationSummary[]): boolean => {
    if (prev.length !== newData.length) return false;
    const prevMap = new Map(prev.map(conv => [conv.accidentClaimId, conv.lastMessage?.messageId]));
    for (const conv of newData) {
        const prevMessageId = prevMap.get(conv.accidentClaimId);
        if (prevMessageId !== conv.lastMessage?.messageId) {
            return false;
        }
    }
    return true;
};

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
    const isFetching = useRef(false);
    const fetchConversations = useCallback(async (): Promise<ConversationSummary[]> => {
        try {
            const data = await apiRequest('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${session?.accessToken}` },
            });
            console.log("Fetched Conversations:", data); // Debug log
            if (!areConversationsEqual(conversations, data.conversations)) {
                setConversations(data.conversations || []);
            }
            return data.conversations || [];
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    }, [session?.accessToken, conversations]);


    const fetchMessages = useCallback(
        async (accidentClaimId: string, page = 1): Promise<void> => {
            if (!session?.accessToken || !accidentClaimId) return;

            try {
                const response = await apiRequest(
                    `/api/messages/conversations/${accidentClaimId}?page=${page}`,
                    {
                        headers: { Authorization: `Bearer ${session.accessToken}` },
                    }
                );

                if (response.messages) {
                    setMessages((prev) => [
                        ...prev.filter((msg) => !response.messages.some((newMsg: InboxMessage) => newMsg.messageId === msg.messageId)),
                        ...response.messages.map((msg: InboxMessage) => ({
                            ...msg,
                            conversationId: accidentClaimId, // Add conversationId to each message
                        })),
                    ]);
                }
                console.log('messages___', messages)
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        },
        [session?.accessToken]
    );

    // Reply to a message
    const replyToMessage = useCallback(
        async (accidentClaimId: string, messageId: number, content: string): Promise<void> => {
            if (!session?.accessToken) throw new Error("Unauthorized");

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/messages/conversations/${accidentClaimId}/messages/${messageId}/reply`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                        body: JSON.stringify({ content }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to send reply");
                }

                toast({ title: "Success", description: "Reply sent successfully." });
                await fetchMessages(accidentClaimId);

            } catch (error: any) {
                toast({ title: "Error", description: error.message || "Failed to send reply.", variant: "destructive" });
            }
        },
        [session, fetchMessages]
    );

    // Send a message to multiple users
    const sendMessageToUsers = useCallback(
        async (
            recipientIds: number[],
            content: string,
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
                    content: content,
                    accident_claim_id: accidentClaimId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send message");
            }

            // Refetch conversations to update state
            await fetchConversations();
        },
        [session, fetchConversations]
    );

    // Send a message to a specific conversation
    const sendMessage = useCallback(
        async (accidentClaimId: string, content: string): Promise<void> => {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    recipient_ids: [/* Populate with appropriate recipient IDs based on context */],
                    content,
                    accident_claim_id: accidentClaimId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send message");
            }

            // Refetch conversations to update state
            await fetchConversations();
        },
        [session, fetchConversations]
    );

    // Mark a message as read
    const markAsRead = useCallback(
        async (accidentClaimId: string, messageId: number): Promise<void> => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/messages/conversations/${accidentClaimId}/messages/${messageId}/mark_read`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session?.accessToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to mark message as read");
                }

                // Update conversation state to reflect unread count decrement
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.accidentClaimId === accidentClaimId
                            ? {
                                ...conv,
                                unreadCount: Math.max((conv.unreadCount || 0) - 1, 0),
                            }
                            : conv
                    )
                );
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to mark message as read.",
                    variant: "destructive",
                });
            }
        },
        [session, setConversations]
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
        const flaskBaseUrl = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL;
        try {
            const data = await apiRequest(`${flaskBaseUrl}/messages/users_claims`, {
                headers: { Authorization: `Bearer ${session?.accessToken}` },
            });
            return data;
        } catch (error) {
            console.error("Error fetching users with claims:", error);
            return null;
        }
    }, [session]);

    // Mark all messages in a conversation as read
    const markMessagesAsRead = useCallback(
        async (accidentClaimId: string): Promise<void> => {
            try {
                const response = await apiRequest(`/api/messages/conversations/claim/${accidentClaimId}/messages/mark_all_read`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        // Authorization is handled server-side
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to mark messages as read");
                }

                await fetchConversations(); // Refresh unread counts after marking messages as read
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        },
        [fetchConversations]
    );

    // Mark all messages as read across all conversations
    const markAllMessagesAsRead = useCallback(async (): Promise<void> => {
        if (!session?.accessToken) return;

        setLoading(true);
        try {
            // Fetch all conversations
            const currentConversations = await fetchConversations();

            // Filter conversations with unread messages
            const conversationsToUpdate = currentConversations.filter(
                (convo) => convo.unreadCount > 0
            );

            for (const convo of conversationsToUpdate) {
                await markMessagesAsRead(String(convo.accidentClaimId));
            }
        } catch (error) {
            console.error("Error marking all messages as read:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchConversations, markMessagesAsRead, session]);


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

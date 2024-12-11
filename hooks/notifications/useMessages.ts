"use client";

import { useState, useCallback } from "react";
import { InboxMessage, ConversationSummary, UserWithClaims } from "@/types";
import { useSession } from "next-auth/react";

export const useMessages = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConversations = useCallback(async (): Promise<
    ConversationSummary[]
  > => {
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
      console.log("Fetched Conversations:", data);
      setConversations(data);
      return data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchMessages = useCallback(
    async (conversationId: number): Promise<void> => {
      if (!session?.accessToken) return;
      setLoading(true);

      try {
        const response = await fetch(
          `/api/messages/conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch messages");

        const data: InboxMessage[] = await response.json();
        console.log(
          `Fetched Messages for Conversation ${conversationId}:`,
          data
        );
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

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
          message_id: originalMessageId, // Correct ID
          content, // Correct message content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reply");
      }
    },
    [session]
  );

  const sendMessageToUsers = useCallback(
    async (
      recipient_ids: number[],
      content: string,
      read_only: boolean,
      accident_claim_id: string
    ): Promise<void> => {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          recipient_ids,
          content,
          read_only,
          accident_claim_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      // Optionally, update local state or refetch conversations
    },
    [session]
  );

  const sendMessage = useCallback(
    async (conversationId: number, content: string): Promise<void> => {
      if (!session?.accessToken) return;

      const conversation = conversations.find(
        (conv) => conv.conversationId === conversationId
      );
      if (!conversation) throw new Error("Conversation not found");

      const recipientIds = conversation.participants
        .filter((participant) => participant.userId !== session.user.id)
        .map((participant) => participant.userId);

      if (recipientIds.length === 0)
        throw new Error("No recipients found in the conversation");

      const accidentClaimId = String(conversation.accidentClaim?.claimId);
      if (!accidentClaimId)
        throw new Error("No accident claim associated with this conversation");

      try {
        await sendMessageToUsers(recipientIds, content, false, accidentClaimId);
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [session, conversations, sendMessageToUsers]
  );

  const markAsRead = useCallback(
    async (messageId: number): Promise<void> => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch("/api/messages/mark_read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ message_id: messageId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to mark message as read"
          );
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
        throw error;
      }
    },
    [session]
  );

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
      console.log("Fetched Inbox Messages:", data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchUsersWithClaims = useCallback(async (): Promise<
    UserWithClaims[] | null
  > => {
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
      console.log("Fetched Users with Claims:", data);
      return data;
    } catch (error) {
      console.error("Error fetching users with claims:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    setConversations,
    setMessages,
    replyToMessage,
    sendMessageToUsers,
    sendMessage,
    markAsRead,
    fetchInboxMessages,
    fetchUsersWithClaims,
  };
};

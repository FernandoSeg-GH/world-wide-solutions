"use client";

import { useState, useCallback } from "react";
import { InboxMessage, ConversationSummary } from "@/types";
import { useSession } from "next-auth/react";

export const useMessages = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConversations = useCallback(async () => {
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
      setConversations(data); // Update conversations state
      return data;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchMessages = useCallback(
    async (conversationId: number) => {
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
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data: InboxMessage[] = await response.json();
        console.log(
          `Fetched Messages for Conversation ${conversationId}:`,
          data
        ); // Debugging
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
    async (messageId: number, content: string) => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch("/api/messages/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ message_id: messageId, content }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send reply");
        }
      } catch (error) {
        console.error("Error replying to message:", error);
        throw error;
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
    ) => {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`, // Ensure Authorization header is set
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

      return response.json();
    },
    [session]
  );

  const sendMessage = useCallback(
    async (conversationId: number, content: string) => {
      if (!session?.accessToken) return;

      const conversation = conversations.find(
        (conv) => conv.conversationId === conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const recipientIds = conversation.participants
        .filter((participant) => participant.userId !== session.user.id)
        .map((participant) => participant.userId);

      if (recipientIds.length === 0) {
        throw new Error("No recipients found in the conversation");
      }

      const accidentClaimId = String(conversation.accidentClaim?.claimId);
      if (!accidentClaimId) {
        throw new Error("No accident claim associated with this conversation");
      }

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
    async (messageId: number) => {
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

  const fetchInboxMessages = useCallback(async () => {
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
      console.log("Fetched Inbox Messages:", data); // Debugging
      setMessages(data);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchUsersWithClaims = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);

    try {
      const response = await fetch("/api/messages/users_claims", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users with claims");
      }

      const data = await response.json();
      console.log("Fetched Users with Claims:", data); // Debugging
      return data;
    } catch (error) {
      console.error("Error fetching users with claims:", error);
      throw error;
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

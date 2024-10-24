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
    if (!session?.accessToken) return;
    setLoading(true);

    try {
      const response = await fetch("/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data: ConversationSummary[] = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
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
    async (recipientIds: number[], content: string, readOnly: boolean) => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            recipient_ids: recipientIds,
            content,
            read_only: readOnly,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
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

      try {
        await sendMessageToUsers(recipientIds, content, false);
      } catch (error) {
        throw error;
      }
    },
    [session, conversations, sendMessageToUsers]
  );

  const markAsRead = useCallback(
    async (messageId: number) => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch("/api/messages/read", {
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
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch inbox messages");
      }
      const data: InboxMessage[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
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
  };
};

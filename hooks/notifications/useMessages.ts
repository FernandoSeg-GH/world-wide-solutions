// // src/hooks/notifications/useMessages.ts
// import { useState, useCallback, useEffect } from "react";
// import { InboxMessage, ConversationSummary, UserWithClaims } from "@/types";
// import { useSession } from "next-auth/react";

// export const useMessages = () => {
//   const { data: session } = useSession();
//   const [conversations, setConversations] = useState<ConversationSummary[]>([]);
//   const [messages, setMessages] = useState<InboxMessage[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [totalUnread, setTotalUnread] = useState<number>(0); // New state for total unread messages

//   const fetchConversations = useCallback(async (): Promise<
//     ConversationSummary[]
//   > => {
//     if (!session?.accessToken) return [];

//     setLoading(true);
//     try {
//       const response = await fetch("/api/messages/conversations", {
//         headers: {
//           Authorization: `Bearer ${session.accessToken}`,
//         },
//       });
//       if (!response.ok) throw new Error("Failed to fetch conversations");

//       const data: ConversationSummary[] = await response.json();
//       console.log("Fetched Conversations:", data);
//       setConversations(data);

//       // Calculate total unread messages
//       const total = data.reduce((acc, convo) => {
//         return acc + (convo.unreadCount || 0);
//       }, 0);
//       setTotalUnread(total);

//       return data;
//     } catch (error) {
//       console.error("Error fetching conversations:", error);
//       return [];
//     } finally {
//       setLoading(false);
//     }
//   }, [session]);

//   const fetchMessages = useCallback(
//     async (conversationId: number): Promise<void> => {
//       if (!session?.accessToken) return;
//       setLoading(true);

//       try {
//         const response = await fetch(
//           `/api/messages/conversations/${conversationId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${session.accessToken}`,
//             },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch messages");

//         const data: InboxMessage[] = await response.json();
//         console.log(
//           `Fetched Messages for Conversation ${conversationId}:`,
//           data
//         );
//         setMessages(data);
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [session]
//   );

//   const replyToMessage = useCallback(
//     async (originalMessageId: number, content: string): Promise<void> => {
//       if (!session?.accessToken) throw new Error("Unauthorized");

//       const response = await fetch("/api/messages/reply", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session.accessToken}`,
//         },
//         body: JSON.stringify({
//           message_id: originalMessageId,
//           content,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to send reply");
//       }
//     },
//     [session]
//   );

//   const sendMessageToUsers = useCallback(
//     async (
//       recipient_ids: number[],
//       content: string,
//       read_only: boolean,
//       accident_claim_id: string
//     ): Promise<void> => {
//       const response = await fetch("/api/messages/send", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${session?.accessToken}`,
//         },
//         body: JSON.stringify({
//           recipient_ids,
//           content,
//           read_only, // This field is not used in Flask; consider removing
//           accident_claim_id,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to send message");
//       }

//       // Optionally, update local state or refetch conversations
//     },
//     [session]
//   );

//   const markAsRead = useCallback(
//     async (messageId: number): Promise<void> => {
//       if (!session?.accessToken) return;
//       try {
//         const response = await fetch("/api/messages/read", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${session.accessToken}`,
//           },
//           body: JSON.stringify({ message_id: messageId }),
//         });
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(
//             errorData.message || "Failed to mark message as read"
//           );
//         }
//       } catch (error) {
//         console.error("Error marking message as read:", error);
//         throw error;
//       }
//     },
//     [session]
//   );

//   const fetchInboxMessages = useCallback(async (): Promise<void> => {
//     if (!session?.accessToken) return;
//     setLoading(true);

//     try {
//       const response = await fetch("/api/messages/inbox", {
//         headers: { Authorization: `Bearer ${session.accessToken}` },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to fetch inbox messages");
//       }

//       const data: InboxMessage[] = await response.json();
//       console.log("Fetched Inbox Messages:", data);
//       setMessages(data);
//     } catch (error) {
//       console.error("Error fetching inbox messages:", error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, [session]);

//   const fetchUsersWithClaims = useCallback(async (): Promise<
//     UserWithClaims[] | null
//   > => {
//     if (!session?.accessToken) return null;
//     setLoading(true);

//     try {
//       const response = await fetch("/api/messages/users_claims", {
//         headers: { Authorization: `Bearer ${session.accessToken}` },
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to fetch users with claims");
//       }

//       const data: UserWithClaims[] = await response.json();
//       console.log("Fetched Users with Claims:", data);
//       return data;
//     } catch (error) {
//       console.error("Error fetching users with claims:", error);
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [session]);

//   const markMessagesAsRead = useCallback(
//     async (conversationId: number): Promise<void> => {
//       if (!session?.accessToken) return;

//       try {
//         // Fetch all messages in the conversation
//         const response = await fetch(
//           `/api/messages/conversations/${conversationId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${session.accessToken}`,
//             },
//           }
//         );

//         if (!response.ok)
//           throw new Error("Failed to fetch messages for marking as read");

//         const data: InboxMessage[] = await response.json();
//         const unreadMessages = data.filter((message) => !message.read);

//         // Mark each unread message as read
//         await Promise.all(
//           unreadMessages.map(async (msg) => {
//             const res = await fetch("/api/messages/read", {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${session.accessToken}`,
//               },
//               body: JSON.stringify({ message_id: msg.messageId }),
//             });
//             if (!res.ok) throw new Error("Failed to mark message as read");
//           })
//         );

//         // Update local state
//         setConversations((prev) =>
//           prev.map((convo) =>
//             convo.conversationId === conversationId
//               ? { ...convo, unreadCount: 0 }
//               : convo
//           )
//         );
//         setTotalUnread((prev) => prev - unreadMessages.length);
//       } catch (error) {
//         console.error("Error marking messages as read:", error);
//       }
//     },
//     [session]
//   );

//   const markAllMessagesAsRead = useCallback(async (): Promise<void> => {
//     if (!session?.accessToken) return;

//     setLoading(true);
//     try {
//       // Fetch all conversations
//       const conversations = await fetchConversations();

//       // Iterate through each conversation and mark unread messages as read
//       await Promise.all(
//         conversations.map(async (convo) => {
//           if (convo.unreadCount > 0) {
//             await markMessagesAsRead(Number(convo.conversationId));
//           }
//         })
//       );
//     } catch (error) {
//       console.error("Error marking all messages as read:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchConversations, markMessagesAsRead, session]);

//   // Optional: Polling for real-time updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchConversations();
//     }, 60000); // Fetch every 60 seconds

//     return () => clearInterval(interval);
//   }, [fetchConversations]);

//   return {
//     conversations,
//     messages,
//     loading,
//     totalUnread,
//     fetchConversations,
//     fetchMessages,
//     setConversations,
//     setMessages,
//     replyToMessage,
//     sendMessageToUsers,
//     markAsRead,
//     fetchInboxMessages,
//     fetchUsersWithClaims,
//     markMessagesAsRead,
//     markAllMessagesAsRead,
//   };
// };

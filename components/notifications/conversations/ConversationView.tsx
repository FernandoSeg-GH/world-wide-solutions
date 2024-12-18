"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMessagesContext } from "@/context/MessagesContext";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
    conversationId: number;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
    const {
        messages,
        fetchMessages,
        replyToMessage,
        loading,
    } = useMessagesContext();

    const { toast } = useToast();
    const { data: session } = useSession();
    const [content, setContent] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);

    useEffect(() => {
        fetchMessages(conversationId);
    }, [conversationId, fetchMessages]);

    const handleSendReply = async () => {
        if (!content.trim()) {
            toast({
                title: "Empty Message",
                description: "Please enter a message.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSending(true);
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) {
                throw new Error("No messages to reply to.");
            }

            await replyToMessage(lastMessage.messageId, content);
            toast({ title: "Success", description: "Reply sent successfully." });
            setContent("");
            await fetchMessages(conversationId);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error sending reply.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <h2 className="text-2xl font-semibold dark:text-white">Conversation</h2>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 rounded-md dark:bg-gray-700 relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                        <span className="ml-2">Loading messages...</span>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg.messageId}
                            className={`flex items-start mb-4 ${msg.senderUsername === session?.user?.username ? "justify-end" : "justify-start"}`}
                        >
                            <div className={cn("flex items-start space-x-2", msg.senderUsername === session?.user?.username ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("w-8 h-8 mt-3 flex items-center justify-center rounded-full  text-white font-bold uppercase mr-2", msg.senderUsername === session?.user?.username ? "bg-navyBlue ml-3" : "bg-blue-500")}>
                                    {msg.senderUsername[0]}
                                </div>
                                <div
                                    className={`max-w-lg p-4 rounded-md shadow-md text-sm break-words ${msg.senderUsername === session?.user?.username ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}
                                >
                                    <p>{msg.content}</p>
                                    <small className="text-gray-500 block mt-1">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages found in this conversation.
                    </div>
                )}
            </div>

            <div className="mt-4 space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full p-2 rounded-md border border-gray-300"
                    disabled={loading || sending}
                />
                <Button
                    onClick={handleSendReply}
                    disabled={sending || !content.trim() || loading}
                    className="w-full text-white bg-primary hover:bg-primary-dark"
                >
                    {sending ? "Sending..." : "Send Reply"}
                </Button>
            </div>
        </div>
    );
};

export default ConversationView;

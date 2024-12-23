"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMessagesContext } from "@/context/MessagesContext";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConversationViewProps {
    conversationId: string;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
    const { messages, fetchMessages, loading, replyToMessage, markAsRead } = useMessagesContext();
    const { toast } = useToast();
    const [content, setContent] = useState<string>("");
    const [sending, setSending] = useState(false);
    const hasMarkedRead = useRef<boolean>(false);

    const handleSendReply = async () => {
        if (!content.trim()) {
            toast({
                title: "Error",
                description: "Message cannot be empty.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSending(true);
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) throw new Error("No previous messages to reply to.");

            await replyToMessage(conversationId, lastMessage.messageId, content);
            setContent("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: String(error) || "Failed to send the message.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
        }
    }, [conversationId, fetchMessages]);


    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const renderMessages = () => {
        const filteredMessages = messages
            .filter((msg) => String(msg.conversationId) === conversationId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return (
            <div className="space-y-4">
                {filteredMessages.map((msg) => (
                    <div
                        key={msg.messageId}
                        className={cn(
                            "flex items-start space-x-4",
                            msg.isSender ? "flex-row-reverse" : ""
                        )}
                    >
                        {/* Avatar */}
                        <Tooltip>
                            <TooltipTrigger
                                className={cn(
                                    "flex items-center justify-center !w-10 !h-10 shrink-0 rounded-full text-white font-bold uppercase",
                                    msg.isSender ? "bg-blue-500 ml-4" : "bg-gray-500"
                                )}
                            >
                                {msg.senderUsername ? msg.senderUsername[0].toUpperCase() : "?"}
                            </TooltipTrigger>

                            <TooltipContent className="p-2 bg-gray-800 text-white rounded-md uppercase text-xs">
                                {msg.senderUsername || "Unknown"}
                            </TooltipContent>
                        </Tooltip>
                        <div
                            className={cn(
                                "p-4 rounded-lg shadow-md text-sm max-w-lg break-words",
                                msg.isSender
                                    ? "bg-blue-100 text-right ml-2 mr-4"
                                    : "bg-gray-200 text-left ml-4 mr-2"
                            )}
                        >
                            <p>{msg.content}</p>
                            <small className="block text-gray-500 mt-2">
                                {new Date(msg.timestamp).toLocaleString()}
                            </small>
                        </div>
                    </div>
                ))}
                {/* Add a reference div at the end */}
                <div ref={messageEndRef} />
            </div>
        );
    };


    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <h2 className="text-2xl font-semibold dark:text-white">Conversation</h2>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md dark:bg-gray-800 relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                        <span className="ml-2 text-gray-500">Loading messages...</span>
                    </div>
                ) : messages.length > 0 ? (
                    renderMessages()
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No messages found.
                    </div>
                )}
            </div>

            {/* Input Section */}
            <div className="mt-4">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    disabled={loading || sending}
                />
                <Button
                    onClick={handleSendReply}
                    disabled={!content.trim() || sending || loading}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {sending ? "Sending..." : "Send Message"}
                </Button>
            </div>
        </div>
    );
};

export default ConversationView;

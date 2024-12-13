"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMessagesContext } from "@/context/MessagesContext";
import { useLayout } from "@/hooks/layout/useLayout";
import { useToast } from "@/components/ui/use-toast";
import Submissions from "@/components/business/forms/submissions";

interface ConversationViewProps {
    conversationId: number;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
    const {
        messages,
        fetchMessages,
        replyToMessage,
        setMessages, // Corrected type usage
        loading
    } = useMessagesContext();

    const { switchSection, currentSection } = useLayout();
    const { toast } = useToast();

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
            toast({
                title: "Success",
                description: "Reply sent successfully.",
            });
            setContent("");
            await fetchMessages(conversationId); // Let context handle message updates
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

    const getUserInitial = (username: string) => username.charAt(0).toUpperCase();

    if (currentSection === "Submissions") {
        return <Submissions />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Conversation</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-md relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                        <span className="ml-2">Loading your messages...</span>
                    </div>
                ) : (
                    messages.length > 0 ? (
                        messages.map((msg) => {
                            const isUserMessage = msg.senderId === conversationId;
                            return (
                                <div
                                    key={msg.messageId}
                                    className={`flex items-start mb-4 ${isUserMessage ? "justify-end" : "justify-start"}`}
                                >
                                    {!isUserMessage && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gray-500 mr-4 shadow-md mt-4">
                                            {getUserInitial(msg.senderUsername || "U")}
                                        </div>
                                    )}

                                    <div className={`max-w-xl p-3 rounded-md shadow-md break-words ${isUserMessage ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}>
                                        <p>{msg.content}</p>
                                        <small className="text-gray-500 block mt-1">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </small>
                                    </div>

                                    {isUserMessage && (
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-blue-500 ml-4 shadow-md mt-4">
                                            {getUserInitial(msg.senderUsername || "U")}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-center">
                            No messages found in this conversation.
                        </div>
                    )
                )}
            </div>

            <div className="mt-4 flex flex-col">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                    disabled={loading || sending}
                />
                <Button
                    onClick={handleSendReply}
                    disabled={sending || !content.trim() || loading}
                    className="mt-2 bg-primary hover:bg-primary-dark text-white"
                >
                    {sending ? "Sending..." : "Send Reply"}
                </Button>
            </div>
        </div>
    );
};

export default ConversationView;

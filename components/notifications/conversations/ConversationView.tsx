"use client";

import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InboxMessage } from '@/types';
import { useLayout } from '@/hooks/layout/useLayout';
import { useToast } from "@/components/ui/use-toast";
import { useMessages } from "@/hooks/notifications/useMessages";
import { useSession } from 'next-auth/react';
import Submissions from '@/components/business/forms/submissions';

interface ConversationViewProps {
    conversationId: number;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
    const { data: session } = useSession();
    const { toast } = useToast();
    const { fetchMessages, messages, sendMessage, loading } = useMessages();
    const { switchSection, currentSection } = useLayout();

    const [content, setContent] = useState<string>('');
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
            await sendMessage(conversationId, content);
            toast({
                title: "Success",
                description: "Reply sent successfully.",
                variant: "default",
            });
            setContent("");
            fetchMessages(conversationId);
        } catch (error: any) {
            console.error("Error sending reply:", error);
            toast({
                title: "Error",
                description: error.message || "Error sending reply.",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div>Loading conversation...</div>;
    }

    if (currentSection === "Submissions") {
        return <Submissions />;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Conversation</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md">
                {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((msg: InboxMessage) => (
                        <div
                            key={msg.messageId}
                            className={`flex flex-col mb-4 p-3 rounded-md max-w-lg ${msg.senderId === session?.user.id
                                ? 'bg-blue-100 text-right ml-auto'
                                : 'bg-gray-200 text-left mr-auto'
                                }`}
                        >
                            <div className='flex flex-col'>
                                <p>{msg.content}</p>
                                <small className="text-gray-500">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </small>
                                {msg.senderId !== session?.user.id && hasSpecificForm(msg) && (
                                    <Button
                                        onClick={() => switchSection("Submissions")}
                                        className="mt-2 bg-primary hover:bg-primary-dark text-white text-sm"
                                    >
                                        View Submissions
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No messages found in this conversation.</div>
                )}
            </div>

            <div className="mt-4">
                <Textarea
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                    aria-label="Type your reply"
                />
                <Button
                    onClick={handleSendReply}
                    disabled={sending || !content.trim()}
                    className="mt-2 bg-primary hover:bg-primary-dark text-white"
                    aria-label="Send Reply"
                >
                    {sending ? "Sending..." : "Send Reply"}
                </Button>
            </div>
        </div>
    );
};

const hasSpecificForm = (message: InboxMessage) => {
    return message.content.includes('patient-personal-information');
};

export default ConversationView;
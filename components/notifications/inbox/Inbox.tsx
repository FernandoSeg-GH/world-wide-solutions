// components/notifications/Inbox.tsx

"use client";
import React, { useEffect, useState } from 'react';
import { InboxMessage } from '@/types';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReplyMessage from '../reply/message';

const Inbox: React.FC = () => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!session?.accessToken) return;

            try {
                const response = await fetch('/api/messages/inbox', {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data: InboxMessage[] = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [session]);

    const handleReplySent = () => {
        setReplyingTo(null);
        // Optionally refetch messages to update read status
        setLoading(true);
        fetch('/api/messages/inbox', {
            headers: {
                Authorization: `Bearer ${session?.accessToken}`,
            },
        })
            .then((response) => response.json())
            .then((data: InboxMessage[]) => setMessages(data))
            .catch((error) => console.error('Error refetching messages:', error))
            .finally(() => setLoading(false));
    };

    const handleMarkAsRead = async (messageId: number) => {
        try {
            const response = await fetch('/api/messages/mark_read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({ message_id: messageId }),
            });
            if (!response.ok) {
                throw new Error('Failed to mark message as read');
            }
            // Update the local state
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.messageId === messageId ? { ...msg, read: true } : msg
                )
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    if (loading) {
        return <div>Loading messages...</div>;
    }

    return (
        <div>
            <h2>Your Messages</h2>
            {messages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                messages.map((msg) => (
                    <Card key={msg.messageId} className="mb-4 p-4 shadow">
                        <h3>From: {msg.senderUsername}</h3>
                        <p>{msg.content}</p>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                        {!msg.read && <span className="text-red-500"> (Unread)</span>}
                        <div className="mt-2">
                            {!msg.read && (
                                <Button
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(msg.messageId)}
                                >
                                    Mark as Read
                                </Button>
                            )}
                            {!msg.readOnly && (
                                <Button
                                    variant="default"
                                    onClick={() => setReplyingTo(msg.messageId)}
                                >
                                    Reply
                                </Button>
                            )}
                        </div>
                        {replyingTo === msg.messageId && (
                            <ReplyMessage
                                messageId={msg.messageId}
                                onReplySent={handleReplySent}
                            />
                        )}
                    </Card>
                ))
            )}
        </div>
    );
};

export default Inbox;

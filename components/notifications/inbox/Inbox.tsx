
"use client";

import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReplyMessage from "../reply/message";
import { InboxMessage } from "@/types";
import { useAppContext } from "@/context/AppProvider";
import MessagingLayout from "../MessagingLayout";

const Inbox: React.FC = () => {
    const { data, actions } = useAppContext();
    const { messages } = data;
    const { messageActions } = actions;
    const { fetchInboxMessages, markAsRead } = messageActions;

    const [replyingTo, setReplyingTo] = React.useState<number | null>(null);

    useEffect(() => {
        fetchInboxMessages();
    }, [fetchInboxMessages]);

    if (!messages) {
        return <div>Loading messages...</div>;
    }

    const handleMarkAsRead = async (messageId: number) => {
        try {
            await markAsRead(messageId);
            await fetchInboxMessages();
        } catch (error: any) {
            console.error("Error marking message as read:", error);
            alert(error.message || "Error marking message as read");
        }
    };

    return (
        <div className="h-full">
            <h2 className="text-2xl font-bold mb-6">Your Messages</h2>
            {/* {messages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                messages.map((msg: InboxMessage) => (
                    <Card key={msg.messageId} className="mb-4 p-4 shadow">
                        <h3 className="text-lg font-semibold">From: {msg.senderUsername}</h3>
                        <p className="mt-2">{msg.content}</p>
                        <small className="text-gray-500">
                            {new Date(msg.timestamp).toLocaleString()}
                        </small>
                        {!msg.read && <span className="text-red-500"> (Unread)</span>}
                        <div className="mt-4 flex space-x-2">
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
                                onReplySent={() => setReplyingTo(null)}
                            />
                        )}
                    </Card>
                ))
            )} */}
            <MessagingLayout />
        </div>
    );
};

export default Inbox;

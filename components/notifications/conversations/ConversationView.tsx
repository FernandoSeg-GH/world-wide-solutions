"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppProvider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InboxMessage } from '@/types';

interface ConversationViewProps {
    conversationId: number;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversationId }) => {
    const { data, actions } = useAppContext();
    const { messages } = data;
    const { messageActions } = actions;
    const { fetchMessages } = messageActions;

    const [content, setContent] = useState<string>('');
    const [sending, setSending] = useState<boolean>(false);

    useEffect(() => {
        fetchMessages(conversationId);
    }, [conversationId, fetchMessages]);

    const handleSendMessage = async () => {
        if (!content.trim()) return;

        try {
            setSending(true);
            await messageActions.sendMessage(conversationId, content);
            setContent('');
            fetchMessages(conversationId);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (!messages) {
        return <div>Loading conversation...</div>;
    }

    return (
        <div>
            <div className="message-list">
                {messages.map((msg: InboxMessage) => (
                    <div key={msg.messageId} className={`message ${msg.senderId === data.currentUser?.id ? 'sent' : 'received'}`}>
                        <p>{msg.content}</p>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                    </div>
                ))}
            </div>
            <div className="message-input mt-4">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button onClick={handleSendMessage} disabled={sending || !content.trim()} className="mt-2">
                    {sending ? 'Sending...' : 'Send'}
                </Button>
            </div>
        </div>
    );
};

export default ConversationView;

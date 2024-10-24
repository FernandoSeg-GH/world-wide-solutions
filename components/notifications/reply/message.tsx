// components/notifications/ReplyMessage.tsx

"use client";
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ReplyMessageProps {
    messageId: number;
    onReplySent: () => void;
}

const ReplyMessage: React.FC<ReplyMessageProps> = ({ messageId, onReplySent }) => {
    const { data: session } = useSession();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleReply = async () => {
        if (!content.trim()) {
            alert('Please enter a reply message.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/messages/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    message_id: messageId,
                    content,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send reply');
            }
            alert('Reply sent successfully');
            setContent('');
            onReplySent();
        } catch (error: any) {
            console.error('Error sending reply:', error);
            alert(error.message || 'Error sending reply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <Textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Type your reply here..."
                rows={3}
            />
            <Button onClick={handleReply} disabled={loading || !content.trim()} className="mt-2">
                {loading ? 'Sending...' : 'Send Reply'}
            </Button>
        </div>
    );
};

export default ReplyMessage;

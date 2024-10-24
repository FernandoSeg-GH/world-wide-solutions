"use client"
import SendMessage from '@/components/notifications/send/message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const AdminNotifications: React.FC = () => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        console.log('Sending notification:', message);
        setMessage('');
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Send a Notification</h2>
            <SendMessage />
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message"
            />
            <Button
                onClick={handleSend}
                disabled={!message}
                className="mt-2"
            >
                Send Notification
            </Button>
        </div>
    );
};

export default AdminNotifications;

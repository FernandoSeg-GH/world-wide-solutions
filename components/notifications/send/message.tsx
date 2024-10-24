import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const SendMessage: React.FC = () => {
    const { data: session } = useSession();
    const [recipientIds, setRecipientIds] = useState<number[]>([]);
    const [content, setContent] = useState<string>('');
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch users (role 1) to display in recipient selection
    useEffect(() => {
        const fetchUsers = async () => {
            if (!session?.accessToken) return;

            try {
                const response = await fetch('/api/users/', {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const role1Users = data.filter((user: User) => user.roleId === 1);
                setUsers(role1Users);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [session]);

    const handleSendMessage = async () => {
        if (recipientIds.length === 0) {
            alert('Please select at least one recipient.');
            return;
        }

        if (!content.trim()) {
            alert('Please enter a message.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    recipient_ids: recipientIds,
                    content,
                    read_only: readOnly,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to send message');
            }
            alert('Message sent successfully');
            // Reset form
            setRecipientIds([]);
            setContent('');
            setReadOnly(false);
        } catch (error: any) {
            console.error('Error sending message:', error);
            alert(error.message || 'Error sending message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Send a Notification</h2>
            <div className="mb-4">
                <label className="block mb-2">Recipients:</label>
                <select
                    multiple
                    value={recipientIds.map(String)} // Mapping recipientIds to strings
                    onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions);
                        setRecipientIds(selectedOptions.map(option => Number(option.value)));
                    }}
                    className="block w-full"
                >
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Content:</label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your notification message"
                    rows={4}
                />
            </div>
            <div className="mb-4">
                <Checkbox
                    checked={readOnly}
                    onChange={(e: React.FormEvent<HTMLButtonElement>) => {
                        const target = e.target as HTMLInputElement;
                        setReadOnly(target.checked);
                    }}
                >
                    Read-Only
                </Checkbox>
            </div>
            <Button
                onClick={handleSendMessage}
                disabled={loading || recipientIds.length === 0 || !content.trim()}
            >
                {loading ? 'Sending...' : 'Send Notification'}
            </Button>
        </div>
    );
};

export default SendMessage;

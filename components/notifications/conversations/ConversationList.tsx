
"use client";
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppProvider';

interface ConversationListProps {
    onSelectConversation: (conversationId: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
    const { data, actions } = useAppContext();
    const { conversations } = data;
    const { messageActions } = actions;
    const { fetchConversations } = messageActions;

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    if (!conversations) {
        return <div>Loading conversations...</div>;
    }

    return (
        <div>
            <h2>Your Conversations</h2>
            {conversations.length === 0 ? (
                <p>No conversations found.</p>
            ) : (
                conversations.map((conv) => (
                    <Card key={conv.conversationId} className="mb-2 p-2">
                        <Button variant="link" onClick={() => onSelectConversation(conv.conversationId)}>
                            {conv.participants.map((p) => p.username).join(', ')}
                        </Button>
                        {conv.lastMessage && (
                            <div>
                                <p>{conv.lastMessage.content}</p>
                                <small>{new Date(conv.lastMessage.timestamp).toLocaleString()}</small>
                            </div>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
};

export default ConversationList;

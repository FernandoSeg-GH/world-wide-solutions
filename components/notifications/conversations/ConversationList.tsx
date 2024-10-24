"use client";

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppProvider';
import { useToast } from '@/components/ui/use-toast';

interface ConversationListProps {
    onSelectConversation: (conversationId: number) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
    const { data, actions } = useAppContext();
    const { conversations } = data;
    const { messageActions } = actions;
    const { fetchConversations } = messageActions;

    const { toast } = useToast();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    if (!conversations) {
        return <div>Loading conversations...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            {conversations.length === 0 ? (
                <p className="text-gray-500">No conversations found.</p>
            ) : (
                conversations.map((conv) => (
                    <Card key={conv.conversationId} className="mb-2 p-2 hover:shadow-md transition-shadow cursor-pointer">
                        <Button
                            variant="link"
                            onClick={() => {
                                onSelectConversation(conv.conversationId);
                                toast({
                                    title: "Conversation Selected",
                                    description: `Conversation with ${conv.participants
                                        .map(p => p.username.charAt(0).toUpperCase() + p.username.slice(1).toLowerCase())
                                        .join(', ')} selected.`,
                                    variant: "default",
                                });

                            }}
                            className="text-left w-full flex flex-col h-auto items-start justify-start overflow-hidden"
                        >
                            <div className="flex flex-col">
                                <div className="flex flex-col justify-between items-start">
                                    <span className="font-medium capitalize">
                                        {conv.participants.map((p) => p.username).join(', ')}
                                    </span>
                                    {conv.lastMessage && (
                                        <span className="text-sm text-gray-500">
                                            {new Date(conv.lastMessage.timestamp).toLocaleString()}
                                        </span>
                                    )}
                                </div>

                                {conv.lastMessage && (
                                    <p
                                        className="text-sm text-gray-600 w-full mt-1 truncate overflow-hidden text-ellipsis"
                                        style={{ whiteSpace: 'nowrap', maxWidth: '100%' }}
                                    >
                                        {conv.lastMessage.content}
                                    </p>
                                )}

                            </div>
                        </Button>
                    </Card>
                ))
            )}
        </div>
    );
};

export default ConversationList;

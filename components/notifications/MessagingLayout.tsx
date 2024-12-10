"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import ConversationList from './conversations/ConversationList';
import ConversationView from './conversations/ConversationView';

const MessagingLayout: React.FC = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

    return (
        <div className="flex flex-col md:flex-row h-full w-full gap-4 flex-grow p-4">
            <Card className="w-full md:w-1/3 p-4 shadow-lg mb-4 md:mb-0 overflow-auto dark:bg-card-dark dark:text-white">
                <ConversationList onSelectConversation={(id: string | number) => setSelectedConversationId(typeof id === 'number' ? id : null)} />
            </Card>

            <Card className="w-full md:w-2/3 p-4 shadow-lg overflow-auto dark:bg-card-dark flex flex-col">
                {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-center">
                        Select a conversation to view messages
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MessagingLayout;

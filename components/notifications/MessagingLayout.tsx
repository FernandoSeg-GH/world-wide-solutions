// Updated MessagingLayout.tsx
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import ConversationList from "./conversations/ConversationList";
import ConversationView from "./conversations/ConversationView";

const MessagingLayout: React.FC = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] w-full  dark:bg-gray-900 gap-4 lg:gap-6">
            {/* Conversation List */}
            <Card className="w-full lg:w-1/3 h-full shadow-lg overflow-y-auto dark:bg-gray-800 px-4">
                <ConversationList
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={(id: number) => setSelectedConversationId(id)}
                />
            </Card>

            {/* Conversation View */}
            <Card className="w-full lg:w-2/3 h-full shadow-lg flex flex-col overflow-y-auto dark:bg-gray-800">
                {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                ) : (
                    <div className="flex items-center justify-center h-full min-h-40 text-gray-500 dark:text-gray-300 text-center">
                        Select a conversation to view messages
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MessagingLayout;

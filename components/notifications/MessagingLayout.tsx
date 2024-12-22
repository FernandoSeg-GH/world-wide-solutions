// components/MessagingLayout.tsx

"use client";

import React, { useState } from "react";
import ConversationList from "./conversations/ConversationList";
import ConversationView from "./conversations/ConversationView";
import { useMessagesContext } from "@/context/MessagesContext";
import { Loader2 } from "lucide-react";

const MessagingLayout: React.FC = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const { loading: conversationsLoading } = useMessagesContext();

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-50 dark:bg-gray-900">
            {/* Sidebar: Conversations */}
            <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="overflow-auto h-full">
                    {conversationsLoading ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <Loader2 className="animate-spin w-6 h-6 mr-2" />
                            Loading conversations...
                        </div>
                    ) : (
                        <ConversationList
                            onSelectConversation={(id) => setSelectedConversationId(id)}
                            selectedConversationId={selectedConversationId}
                        />
                    )}
                </div>
            </div>

            {/* Content View */}
            <div className="flex-1">
                {selectedConversationId ? (
                    <ConversationView conversationId={selectedConversationId} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-300">
                        Select a conversation to view messages
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingLayout;

"use client"
import React from "react";
import { ConversationSummary as ConversationType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface ConversationSummaryProps {
    conversation: ConversationType;
    isSelected: boolean;
    onClick: () => void;
    unreadCount: number;
    onMarkAsRead: (conversationId: number) => void;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
    conversation,
    isSelected,
    onClick,
    unreadCount,
    onMarkAsRead,
}) => {
    const { claimId, lastMessage, participants } = conversation;
    const { data: session } = useSession();

    const userIsRecipient = lastMessage?.senderUsername !== session?.user?.username;
    const formattedTimestamp = lastMessage?.timestamp
        ? new Date(lastMessage.timestamp).toLocaleString()
        : "Unknown";

    const fromUser = participants[0]?.username;
    const toUser = participants.length > 1 ? participants[1]?.username : "Unknown";

    return (
        <div
            className={`flex flex-col space-y-2 p-4 mb-2 border cursor-pointer hover:bg-gray-200 rounded-lg transition-colors duration-150 
            ${isSelected ? "bg-gray-200" : ""} 
            ${unreadCount > 0 ? "bg-blue-100" : ""}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Claim: <span className="text-blue-600 underline">{claimId}</span>
                </h3>
                <span className="text-sm text-gray-500">{formattedTimestamp}</span>
            </div>

            <div className="text-sm text-gray-600">
                <span className="font-bold">From:</span> {fromUser}
                <span className="font-bold ml-4">To:</span> {toUser}
            </div>

            <div className="text-sm text-gray-600">
                {lastMessage?.content || "No messages yet"}
            </div>

            {userIsRecipient && unreadCount > 0 && (
                <button
                    className="text-sm text-blue-600 underline"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(conversation.conversationId);
                    }}
                >
                    Mark as Read
                </button>
            )}
        </div>
    );
};

export default ConversationSummary; 
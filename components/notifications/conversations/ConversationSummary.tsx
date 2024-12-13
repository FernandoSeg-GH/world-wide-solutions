// ConversationSummary.tsx

import React from "react";
import { ConversationSummary as ConversationType } from "@/types";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Button } from "@/components/ui/button";

interface ConversationSummaryProps {
    conversation: ConversationType;
    isSelected: boolean;
    onClick: () => void;
    unreadCount: number;
    onMarkAsRead: (conversationId: number) => void; // New prop
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
    conversation,
    isSelected,
    onClick,
    unreadCount,
    onMarkAsRead,
}) => {
    const { claimId, lastMessage, participants } = conversation;

    const formattedTimestamp = lastMessage?.timestamp
        ? new Date(lastMessage.timestamp).toLocaleString()
        : null;

    return (
        <div
            className={`flex flex-col p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors duration-150 ${isSelected ? "bg-gray-200" : ""
                } ${unreadCount > 0 ? "bg-blue-100" : ""}`} // Apply blue background if unreadCount > 0
            onClick={onClick}
        >
            <div className="flex justify-between items-center w-full">
                <h3 className="text-md font-medium text-gray-800 truncate">
                    Subject: <span className="font-semibold">Claim #{claimId}</span>
                </h3>
                {formattedTimestamp && (
                    <span className="text-xs text-gray-400">{formattedTimestamp}</span>
                )}
            </div>

            <div className="text-sm text-gray-700 mt-1">
                <span className="font-medium">From:</span>{" "}
                {lastMessage?.senderUsername || "Unknown Sender"}
            </div>

            <div className="text-sm text-gray-700">
                <span className="font-medium">To:</span>{" "}
                {participants && participants.length > 0
                    ? participants.map((p) => p.username).join(", ")
                    : "N/A"}
            </div>

            <div className="mt-1 text-sm text-gray-600 line-clamp-1">
                {lastMessage?.content || "No messages yet"}
            </div>

            {/* Display "New" badge and "Mark as Read" button if there are unread messages */}
            {unreadCount > 0 && (
                <div className="mt-2 self-start flex items-center space-x-2">
                    <Badge
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(conversation.conversationId);
                        }}
                    >
                        New
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(conversation.conversationId);
                        }}
                    >
                        Mark as Read
                    </Button>
                </div>
            )}

        </div>
    );
};

export default ConversationSummary;

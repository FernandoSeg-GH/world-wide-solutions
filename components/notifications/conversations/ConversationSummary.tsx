import React from "react";
import { ConversationSummary as ConversationType } from "@/types";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface ConversationSummaryProps {
    conversation: ConversationType;
    isSelected: boolean;
    onClick: () => void;
    unreadCount: number;
    onMarkAsRead: (accidentClaimId: string, messageId: number) => void;
}

const ConversationSummary: React.FC<ConversationSummaryProps> = ({
    conversation,
    isSelected,
    onClick,
    unreadCount,
    onMarkAsRead,
}) => {
    const { accidentClaimId, lastMessage, participants } = conversation;
    const { data: session } = useSession();

    const formattedTimestamp = lastMessage?.timestamp
        ? new Date(lastMessage.timestamp).toLocaleString()
        : "Unknown";

    const fromUser =
        lastMessage?.senderId === session?.user?.id
            ? "You"
            : lastMessage?.senderUsername || "Unknown";

    const hasParticipants = Array.isArray(participants);
    const recipientUsernames = hasParticipants
        ? participants
            .filter(p => p.userId !== session?.user?.id)
            .map(p => p.username)
            .join(", ") || "Unknown"
        : "Unknown";

    const handleMarkAsRead = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation(); // Prevent triggering onClick of the parent div
        if (lastMessage?.messageId) {
            onMarkAsRead(accidentClaimId, lastMessage.messageId);
        } else {
            console.error("messageId is undefined for conversation:", conversation);
        }
    };

    return (
        <div
            className={`flex flex-col space-y-2 2xl:space-y-0 p-4 mb-2 border cursor-pointer hover:bg-gray-200 rounded-lg transition-colors duration-150 
            ${isSelected ? "bg-gray-200" : ""} 
            ${unreadCount > 0 ? "bg-blue-100" : ""}`}
            onClick={onClick}
        >
            {/* Claim ID and Timestamp */}
            <div className="flex flex-col ">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Claim: <span className="underline">{accidentClaimId}</span>
                </h3>
                <span className="text-sm text-gray-500 2xl:text-right">
                    {formattedTimestamp}
                </span>
            </div>

            {/* From and To Information */}
            <div className="flex flex-col 2xl:flex-row 2xl:space-x-4 text-sm text-gray-600">
                <div>
                    <span className="font-bold">From:</span> {fromUser}
                </div>
                <div>
                    <span className="font-bold">To:</span> {recipientUsernames}
                </div>
            </div>

            {/* Last Message */}
            <div className="text-sm text-gray-600 truncate 2xl:max-w-xs">
                {lastMessage?.content || "No messages yet"}
            </div>

            {/* Mark as Read Button */}
            {lastMessage && unreadCount > 0 && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent parent click
                        if (lastMessage?.messageId) {
                            onMarkAsRead(accidentClaimId, lastMessage.messageId); // Correctly pass messageId
                        } else {
                            console.error("messageId is undefined for conversation:", conversation);
                        }
                    }}
                    size="sm"
                    variant="outline"
                >
                    Mark as Read
                </Button>

            )}
        </div>
    );
};

export default ConversationSummary;

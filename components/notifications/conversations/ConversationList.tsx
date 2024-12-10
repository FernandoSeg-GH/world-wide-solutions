"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useMessages } from "@/hooks/notifications/useMessages";
import { ConversationSummary as ConversationType } from "@/types";
import { PlusIcon } from "lucide-react";

interface Claim {
    claimId: number;
    claimantName: string;
    status: string;
}

interface UserWithClaims {
    userId: number;
    username: string;
    claims: Claim[];
}

const ConversationList: React.FC<{
    onSelectConversation: (conversationId: string | number) => void;
}> = ({ onSelectConversation }) => {
    const { toast } = useToast();
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState<string>("");
    const [usersWithClaims, setUsersWithClaims] = useState<UserWithClaims[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        sendMessageToUsers,
        fetchConversations,
        fetchUsersWithClaims,
        conversations,
        setConversations,
    } = useMessages();

    const role_id = session?.user?.role?.id;

    useEffect(() => {
        setIsLoading(true);
        fetchConversations();

        (async () => {
            try {
                const data = await fetchUsersWithClaims();
                setUsersWithClaims(data || []);

                if (role_id === 1) {
                    setSelectedUserId(Number(session?.user?.id));
                }

            } catch (error: any) {
                toast({
                    title: "Error",
                    description: "Failed to load users and claims.",
                    variant: "destructive",
                });
                console.error("Error fetching users with claims:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [fetchConversations, fetchUsersWithClaims, session, toast, role_id]);

    const handleOpenModal = () => {
        setSelectedClaimId(null);
        setMessageContent("");
        // If role 1, user is already known (themselves)
        // If role 2,3,4, clear the selectedUserId
        if (role_id !== 1) {
            setSelectedUserId(null);
        }
        setIsModalOpen(true);
    };

    const handleSendMessage = async () => {
        // Validation
        if (role_id === 1) {
            // Role 1: must have a claim and a message
            if (!selectedClaimId || !messageContent.trim()) {
                toast({
                    title: "Missing Information",
                    description: "Please select a claim and enter a message.",
                    variant: "destructive",
                });
                return;
            }
        } else {
            // Roles 2,3,4: must have both a user and a claim
            if (!selectedUserId || !selectedClaimId || !messageContent.trim()) {
                toast({
                    title: "Missing Information",
                    description: "Please select a user, a claim, and enter a message.",
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            const payload = {
                recipient_ids: [selectedUserId!],
                content: messageContent.trim(),
                read_only: false,
                accident_claim_id: selectedClaimId,
            };

            // For role 1, selectedUserId is themselves, so we need to pick another participant?
            // Actually, if role 1 starts a conversation, we need at least one recipient_id different from themselves.
            // Adjust logic: For role 1, we must choose from the claims that belong to them. 
            // The "recipient_ids" here is a bit ambiguous. 
            // Let's clarify the logic:
            // If role 1 is starting a conversation, who are they messaging to?
            // The UI currently only sets recipient_ids from selectedUserId.
            // For role 1, we should provide a default "recipient" that would be from "uniqueUsers" 
            // Actually, for role 1 scenario:
            // If role 1 is messaging, they must be able to pick a claim and maybe the admin user that the message is going to.
            // Let's force a scenario:
            // If role 1 is starting a conversation, since they see only their claims, 
            // we can show all admins in the user dropdown (like for roles 2,3,4) but disabled if we don't want that?
            // The problem states: 
            // "if user role 1 start the conversation, user role2,3,4 doesn't see it."
            // We must ensure that user role 2,3,4 are always participants or can see all conversations.

            // Let's just ensure that for role 1, they must also pick the user (like roles 2,3,4 do), 
            // since otherwise who are they messaging to?
            // This gives user 1 the ability to pick from the uniqueUsers and a claim they own.
            // If we want user 1 to skip user selection, we must define a default recipient (like a system user).

            // To keep consistent, let's require user selection for everyone. 
            // If the product requires otherwise, we can adjust. For now, let's unify logic:
            // Everyone picks user and claim.

            await sendMessageToUsers(
                payload.recipient_ids,
                payload.content,
                payload.read_only,
                payload.accident_claim_id
            );

            toast({
                title: "Success",
                description: "Message sent successfully.",
                variant: "default",
            });

            setIsModalOpen(false);
            const updatedConversations = await fetchConversations();
            setConversations(updatedConversations);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send the message.",
                variant: "destructive",
            });
            console.error("Error sending message:", error);
        }
    };

    const uniqueUsers = useMemo(
        () =>
            usersWithClaims.map((user) => ({
                userId: user.userId,
                username: user.username,
            })),
        [usersWithClaims]
    );

    // Filter claims of the selected user
    const selectedUserClaims = useMemo(() => {
        if (!selectedUserId) return [];
        const userObj = usersWithClaims.find((u) => u.userId === selectedUserId);
        return userObj?.claims || [];
    }, [selectedUserId, usersWithClaims]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b pb-3 items-center justify-between">
                <h2 className="text-xl font-semibold">Your Conversations</h2>

                <Button
                    onClick={handleOpenModal}
                    variant="outline"
                    className="text-xs"
                >
                    <PlusIcon className="mr-2" size={16} />
                    New Conversation
                </Button>
            </div>

            <div className="flex-1 overflow-auto mt-4">
                {conversations.length > 0 ? (
                    conversations.map((conversation) =>
                        conversation.conversationId !== undefined ? (
                            <ConversationSummary
                                key={conversation.conversationId}
                                conversation={conversation}
                                onClick={() => onSelectConversation(conversation.conversationId!)}
                            />
                        ) : null
                    )
                ) : (
                    <p className="text-gray-500 mt-4">No conversations found</p>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Conversation</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="space-y-4">
                        {isLoading ? (
                            <div>Loading users...</div>
                        ) : (
                            <>
                                {/* Everyone picks a user and a claim now for clarity */}
                                <Select
                                    onValueChange={(value) =>
                                        setSelectedUserId(Number(value))
                                    }
                                    value={
                                        selectedUserId
                                            ? String(selectedUserId)
                                            : undefined
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueUsers.map((user) => (
                                            <SelectItem
                                                key={user.userId}
                                                value={String(user.userId)}
                                            >
                                                {user.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    onValueChange={(value) =>
                                        setSelectedClaimId(value)
                                    }
                                    disabled={!selectedUserId}
                                    value={selectedClaimId || undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a claim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedUserId ? (
                                            selectedUserClaims.length > 0 ? (
                                                selectedUserClaims.map((claim) => (
                                                    <SelectItem
                                                        key={claim.claimId}
                                                        value={String(claim.claimId)}
                                                    >
                                                        {`Claim #${claim.claimId} - ${claim.claimantName} (${claim.status})`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <p className="p-2">No claims available for this user</p>
                                            )
                                        ) : (
                                            <p className="p-2">Select a user first</p>
                                        )}
                                    </SelectContent>
                                </Select>

                                <textarea
                                    className="w-full border rounded-md p-2"
                                    placeholder="Enter your message..."
                                    value={messageContent}
                                    onChange={(e) =>
                                        setMessageContent(e.target.value)
                                    }
                                />
                            </>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            disabled={
                                !selectedUserId ||
                                !selectedClaimId ||
                                !messageContent.trim()
                            }
                        >
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConversationList;


export function ConversationSummary({
    conversation,
    onClick,
}: {
    conversation: ConversationType;
    onClick: () => void;
}) {
    const { accidentClaimId, lastMessage, participants } = conversation;

    const formattedTimestamp = lastMessage?.timestamp
        ? new Date(lastMessage.timestamp).toLocaleString()
        : null;

    return (
        <div
            className="flex flex-col p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-150"
            onClick={onClick}
        >
            <div className="flex justify-between items-center w-full">
                <h3 className="text-md font-medium text-gray-800 truncate">
                    Subject: <span className="font-semibold">Claim #{accidentClaimId}</span>
                </h3>
            </div>
            {formattedTimestamp && (
                <span className="text-xs text-gray-400 my-1 underline">
                    {formattedTimestamp}
                </span>
            )}

            <div className="text-sm text-gray-700">
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
        </div>
    );
}

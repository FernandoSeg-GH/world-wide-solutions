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

// Define TypeScript interfaces for better type safety
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
    onSelectConversation: (conversationId: number) => void;
}> = ({ onSelectConversation }) => {
    const { toast } = useToast();
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
    const [messageContent, setMessageContent] = useState<string>("");
    const [usersWithClaims, setUsersWithClaims] = useState<UserWithClaims[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { sendMessageToUsers, fetchConversations, fetchUsersWithClaims } = useMessages();

    useEffect(() => {
        setIsLoading(true);
        fetchConversations();
        (async () => {
            try {
                const data = await fetchUsersWithClaims();
                setUsersWithClaims(data || []);
                console.log("Fetched Users with Claims:", data);
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
    }, [fetchConversations, fetchUsersWithClaims, toast]);

    const handleOpenModal = () => {
        if (session?.user?.role?.id !== 1) {
            setIsModalOpen(true);
        } else {
            toast({
                title: "Action Not Allowed",
                description: "Only privileged users can start new conversations.",
                variant: "destructive",
            });
        }
    };

    const handleSendMessage = async () => {
        if (!selectedUserId || !selectedClaimId || !messageContent.trim()) {
            toast({
                title: "Missing Information",
                description: "Please select a user, claim, and enter a message.",
                variant: "destructive",
            });
            return;
        }

        try {
            const claimId = Number(selectedClaimId);
            if (isNaN(claimId) || claimId <= 0) {
                throw new Error("Invalid claim ID.");
            }

            const payload = {
                recipient_ids: [selectedUserId],
                content: messageContent.trim(),
                read_only: false,
                accident_claim_id: claimId,
            };

            console.log("Sending message with payload:", payload); // Debugging

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
            await fetchConversations(); // Refresh conversations
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send the message.",
                variant: "destructive",
            });
            console.error("Error sending message:", error);
        }
    };



    // Extract unique users using useMemo for optimization
    const uniqueUsers = useMemo(() => {
        return usersWithClaims.map((user) => ({
            userId: user.userId,
            username: user.username,
        }));
    }, [usersWithClaims]);

    // Log uniqueUsers for debugging
    useEffect(() => {
        console.log("Unique Users:", uniqueUsers);
    }, [uniqueUsers]);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            <Button
                onClick={handleOpenModal}
                className="mb-4 bg-primary hover:bg-primary-dark text-white"
            >
                Start New Conversation
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="space-y-4">
                        {isLoading ? (
                            <div>Loading users...</div>
                        ) : (
                            <>
                                {/* Users Dropdown */}
                                <Select onValueChange={(value) => setSelectedUserId(Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueUsers.map((user) => (
                                            <SelectItem key={user.userId} value={String(user.userId)}>
                                                {user.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Claims Dropdown */}
                                <Select
                                    onValueChange={(value) => setSelectedClaimId(Number(value))}
                                    disabled={!selectedUserId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a claim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedUserId ? (
                                            usersWithClaims.some(
                                                (user) =>
                                                    user.userId === selectedUserId && user.claims.length > 0
                                            ) ? (
                                                usersWithClaims
                                                    .find((user) => user.userId === selectedUserId)
                                                    ?.claims.map((claim) => (
                                                        <SelectItem
                                                            key={claim.claimId}
                                                            value={String(claim.claimId)}
                                                        >
                                                            {`Claim #${claim.claimId} - ${claim.claimantName} (${claim.status})`}
                                                        </SelectItem>
                                                    ))
                                            ) : (
                                                <p >
                                                    No claims available for this user
                                                </p>
                                            )
                                        ) : (
                                            <p >Select a user first</p>
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Message Textarea */}
                                <textarea
                                    className="w-full border rounded-md p-2"
                                    placeholder="Enter your message..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
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

// ConversationList.tsx

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
import { useMessagesContext } from "@/context/MessagesContext"; // Import the context hook
import { ConversationSummary as ConversationType, UserWithClaims } from "@/types";
import { Loader2, PlusIcon } from "lucide-react";
import ConversationSummary from "./ConversationSummary";
import { Claim } from "@/components/business/forms/custom/accident-claim/config/types";

interface ConversationListProps {
    onSelectConversation: (conversationId: number) => void;
    selectedConversationId: number | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
    onSelectConversation,
    selectedConversationId,
}) => {
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
        markMessagesAsRead,
        setConversations,
    } = useMessagesContext(); // Use the context

    const role_id = session?.user?.role?.id;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await fetchConversations();
                const data = await fetchUsersWithClaims();
                setUsersWithClaims(data || []);

                if (role_id === 1 && session?.user?.id) {
                    setSelectedUserId(Number(session.user.id));
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
        };

        loadData();
    }, [fetchConversations, fetchUsersWithClaims, session, toast, role_id]);

    const handleOpenModal = () => {
        setSelectedClaimId(null);
        setMessageContent("");
        if (role_id !== 1) {
            setSelectedUserId(null);
        }
        setIsModalOpen(true);
    };

    const handleSendMessage = async () => {
        if (!selectedClaimId || !messageContent.trim()) {
            toast({
                title: "Missing Information",
                description: "Please select a claim and enter a message.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            recipient_ids: role_id !== 1 ? [selectedUserId!] : [Number(session?.user.id)],
            content: messageContent.trim(),
            accident_claim_id: selectedClaimId,
        };

        try {
            await sendMessageToUsers(
                payload.recipient_ids,
                payload.content,
                false, // readOnly
                String(payload.accident_claim_id)
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

    const selectedUserClaims = useMemo(() => {
        if (!selectedUserId) return [];
        const userObj = usersWithClaims.find((u) => u.userId === selectedUserId);
        return userObj?.claims || [];
    }, [selectedUserId, usersWithClaims]);

    console.log('conversations', conversations)
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pt-4 pb-2">
                <h2 className="text-xl font-semibold">Your Conversations</h2>
                <div className="md:hidden">
                    <Button onClick={handleOpenModal} variant="outline" size="sm">
                        <PlusIcon className="mr-2" size={16} />
                        New Conversation
                    </Button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-auto flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Loading conversations...
                    </div>
                ) : conversations.length > 0 ? (
                    conversations.map((conversation) =>
                        conversation.conversationId !== undefined ? (
                            <ConversationSummary
                                key={conversation.conversationId}
                                conversation={conversation}
                                isSelected={conversation.conversationId === selectedConversationId}
                                onClick={() => {
                                    onSelectConversation(conversation.conversationId!);
                                    markMessagesAsRead(conversation.conversationId!); // Mark as read on click
                                }}
                                unreadCount={conversation.unreadCount}
                                onMarkAsRead={(id: number) => markMessagesAsRead(id)}
                            />
                        ) : null
                    )
                ) : (
                    <p className="text-gray-500 mt-4">No conversations found</p>
                )}
            </div>

            {/* New Conversation Button for Desktop */}
            <div className="my-4 hidden md:block w-full">
                <Button onClick={handleOpenModal} variant="outline" className="w-full">
                    <PlusIcon className="mr-2" size={16} />
                    New Conversation
                </Button>
            </div>

            {/* New Conversation Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Conversation</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                                <span className="ml-2 text-gray-600">Loading users...</span>
                            </div>
                        ) : (
                            <>
                                {/* User Selection */}
                                <Select
                                    onValueChange={(value) => setSelectedUserId(Number(value))}
                                    value={selectedUserId ? String(selectedUserId) : undefined}
                                    disabled={role_id === 1} // Disable for Role 1
                                >
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

                                {/* Claim Selection */}
                                <Select
                                    onValueChange={(value) => {
                                        console.log("Claim selected:", value);  // Debug log
                                        setSelectedClaimId(value);
                                    }}
                                    disabled={(role_id !== 1 && !selectedUserId) || isLoading}
                                    value={selectedClaimId || undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a claim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedUserId ? (
                                            selectedUserClaims.length > 0 ? (
                                                selectedUserClaims.map((claim: Claim) => (
                                                    <SelectItem key={claim.claim_id} value={claim.claim_id}>
                                                        {`Claim #${claim.claim_id || "N/A"} - ${claim.full_name || "Unknown"} (${claim.status || "Unknown"})`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2">No claims available for this user</div>
                                            )
                                        ) : role_id === 1 ? (
                                            usersWithClaims
                                                .filter(user => user.userId === Number(session?.user?.id))
                                                .flatMap(user => user.claims)
                                                .map((claim) => (
                                                    <SelectItem key={claim.claim_id} value={claim.claim_id}>
                                                        {`Claim #${claim.claim_id || "N/A"} - ${claim.full_name || "Unknown"} (${claim.status || "Unknown"})`}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className="p-2">Select a user first</div>
                                        )}
                                    </SelectContent>
                                </Select>


                                {/* Message Content */}
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
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            disabled={
                                (role_id !== 1 && (!selectedUserId || !selectedClaimId)) || !messageContent.trim()
                            }
                        >
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ConversationList;

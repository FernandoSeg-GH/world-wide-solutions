import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { useMessagesContext } from "@/context/MessagesContext";
import ConversationSummary from "./ConversationSummary";
import { Loader2, PlusIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserWithClaims } from "@/types";
import { debounce } from "lodash";

interface ConversationListProps {
    onSelectConversation: (accidentClaimId: string) => void;
    selectedConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
    onSelectConversation,
    selectedConversationId,
}) => {
    const { toast } = useToast();
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState<string>("");
    const [usersWithClaims, setUsersWithClaims] = useState<UserWithClaims[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {
        conversations,
        fetchConversations,
        fetchUsersWithClaims,
        markAsRead,
        sendMessageToUsers,
        setConversations,
        loading,
    } = useMessagesContext();

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

    const filteredConversations = useMemo(() => {
        const parseDate = (dateString: string | null) =>
            dateString ? new Date(dateString).getTime() : -Infinity;

        const sortedConversations = conversations
            .slice()
            .sort((a, b) => parseDate(b.lastMessage!.timestamp) - parseDate(a.lastMessage!.timestamp));

        if (!debouncedSearchTerm) return sortedConversations;

        return sortedConversations.filter((conv) =>
            conv.accidentClaimId?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [debouncedSearchTerm, conversations]);

    const handleSearch = debounce((term: string) => {
        setDebouncedSearchTerm(term);
    }, 300);

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
        console.log("Session user ID:", session?.user?.id);
        try {
            await sendMessageToUsers(
                payload.recipient_ids,
                payload.content.trim(),
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

    const selectedUserClaims = useMemo(() => {
        if (role_id === 1 && session?.user?.id) {
            const userObj = usersWithClaims.find((u) => u.userId === Number(session.user.id));
            return userObj?.claims || [];
        }
        if (!selectedUserId) return [];
        const userObj = usersWithClaims.find((u) => u.userId === selectedUserId);
        return userObj?.claims || [];
    }, [selectedUserId, usersWithClaims, role_id, session]);


    console.log('filteredConversations', filteredConversations);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Inbox</h1>
                {session?.user?.role.id && [1, 2, 3, 4].includes(session.user.role.id) && (
                    <Button
                        onClick={handleOpenModal}
                        variant="outline"
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="mr-2" size={16} />
                        New Message
                    </Button>
                )}
            </div>
            <div className="flex flex-col space-y-2 p-4 border-b border-t dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Search by claim ID or name"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>

            <div className="flex-1 overflow-auto flex flex-col p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <Loader2 className="animate-spin w-6 h-6 mr-2" />
                        Loading conversations...
                    </div>
                ) : filteredConversations && filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                        <ConversationSummary
                            key={conversation.accidentClaimId}
                            conversation={conversation}
                            isSelected={
                                String(conversation.accidentClaimId) === String(selectedConversationId)
                            }
                            onClick={() => onSelectConversation(conversation.accidentClaimId)}
                            unreadCount={conversation.unreadCount || 0}
                            onMarkAsRead={(messageId) =>
                                markAsRead(conversation.accidentClaimId, Number(messageId))
                            }
                        />
                    ))
                ) : (
                    <p className="text-gray-500 mt-4 text-center">
                        {conversations.length > 0
                            ? "No conversations match your search."
                            : "No conversations available."}
                    </p>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                                <span className="ml-2">Loading users...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* User Selection */}
                                {
                                    role_id !== 1 && (
                                        <div>
                                            <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700">
                                                Select a User
                                            </label>
                                            <Select
                                                onValueChange={(value) => setSelectedUserId(Number(value))}
                                                value={selectedUserId ? String(selectedUserId) : undefined}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {usersWithClaims.map((user) => (
                                                        <SelectItem key={user.userId} value={String(user.userId)}>
                                                            {user.username}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )
                                }

                                {/* Claim Selection */}
                                <div>
                                    <label htmlFor="claimSelect" className="block text-sm font-medium text-gray-700">
                                        Select a Claim
                                    </label>
                                    <Select
                                        onValueChange={setSelectedClaimId}
                                        value={selectedClaimId || undefined}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a claim" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedUserId ? (
                                                selectedUserClaims.map((claim) => (
                                                    <SelectItem key={claim.claim_id} value={claim.claim_id}>
                                                        {`Claim #${claim.claim_id || "N/A"} - ${claim.full_name || "Unknown"} (${claim.status || "Unknown"})`}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2">Select a user first</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Message Input */}
                                <div>
                                    <label
                                        htmlFor="messageContent"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Message Content
                                    </label>
                                    <textarea
                                        id="messageContent"
                                        className="w-full border rounded-md p-2"
                                        placeholder="Enter your message..."
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendMessage}
                            disabled={!selectedClaimId || !messageContent.trim()}
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

"use client"
import React, { useState, useEffect, useMemo } from "react";
import { useMessagesContext } from "@/context/MessagesContext";
import { useToast } from "@/components/ui/use-toast";
import { UserWithClaims } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NewMessageProps {
    onClose: () => void;
}

const NewMessage: React.FC<NewMessageProps> = ({ onClose }) => {
    const { sendMessageToUsers, fetchUsersWithClaims } = useMessagesContext();
    const { toast } = useToast();
    const [usersWithClaims, setUsersWithClaims] = useState<UserWithClaims[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [claimId, setClaimId] = useState<string | null>(null);
    const [messageContent, setMessageContent] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchUsersWithClaims();
                setUsersWithClaims(data || []);
            } catch (error) {
                toast({ title: "Error", description: "Failed to load users and claims.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [fetchUsersWithClaims, toast]);

    const handleSend = async () => {
        if (!claimId || !messageContent.trim()) {
            toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
            return;
        }

        try {

            const recipientIds = selectedUserId ? [selectedUserId] : [];
            await sendMessageToUsers(recipientIds, messageContent.trim(), claimId);
            toast({ title: "Success", description: "Message sent successfully." });
            onClose();
        } catch (error) {
            toast({ title: "Error", description: "Failed to send the message.", variant: "destructive" });
        }
    };


    const selectedUserClaims = useMemo(() => {
        if (!selectedUserId) return [];
        const user = usersWithClaims.find((u) => u.userId === selectedUserId);
        return user?.claims || [];
    }, [selectedUserId, usersWithClaims]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 space-y-4">
                <h2 className="text-lg font-semibold">New Message</h2>
                {loading ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
                        <span className="ml-2 text-gray-600">Loading users...</span>
                    </div>
                ) : (
                    <>
                        {/* User Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Select User</label>
                            <Select onValueChange={(value) => setSelectedUserId(Number(value))}>
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

                        {/* Claim Selector */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Claim</label>
                            <Select
                                onValueChange={(value) => setClaimId(value)}
                                value={claimId || undefined}
                            >
                                <SelectTrigger className="truncate-item w-full text-left">
                                    <SelectValue placeholder="Select a claim" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedUserClaims.length > 0 ? (
                                        selectedUserClaims.map((claim) => (
                                            <SelectItem
                                                key={claim.claim_id}
                                                value={String(claim.claim_id)}
                                                className=""
                                            >
                                                #{claim.claim_id} - {claim.full_name} ({claim.status})
                                            </SelectItem>

                                        ))
                                    ) : (
                                        <SelectItem value="no-claims" disabled>
                                            No claims available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Message Content */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Message</label>
                            <textarea
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={4}
                                placeholder="Type your message..."
                            />
                        </div>
                    </>
                )}

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={!claimId || !messageContent.trim()}>
                        {
                            loading ? "Sending..." : "Send Message"
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NewMessage;

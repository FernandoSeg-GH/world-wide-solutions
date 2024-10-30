"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/AppProvider";
import { useToast } from "@/components/ui/use-toast";

const SendMessage: React.FC = () => {
    const { data, actions } = useAppContext();
    const { users, forms } = data;
    const { formActions, fetchAllUsers, messageActions } = actions;
    const { fetchAllForms } = formActions;
    const { sendMessageToUsers } = messageActions;

    const { toast } = useToast();

    const [recipientIds, setRecipientIds] = useState<number[]>([]);
    const [content, setContent] = useState<string>("");
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchAllUsers();
        fetchAllForms();
    }, [fetchAllUsers, fetchAllForms]);

    const handleSendMessage = async () => {
        if (recipientIds.length === 0) {
            toast({
                title: "No Recipients",
                description: "Please select at least one recipient.",
                variant: "destructive",
            });
            return;
        }

        if (!content.trim()) {
            toast({
                title: "Empty Message",
                description: "Please enter a message.",
                variant: "destructive",
            });
            return;
        }

        let messageContent = content;
        if (selectedFormId) {
            const selectedForm = forms?.find((form) => form.id === selectedFormId);
            if (selectedForm) {
                messageContent += `\n\nForm URL: ${selectedForm.shareUrl}`;
            }
        }

        try {
            setLoading(true);
            await sendMessageToUsers(recipientIds, messageContent, readOnly);
            toast({
                title: "Success",
                description: "Message sent successfully.",
                variant: "default",
            });

            setRecipientIds([]);
            setContent("");
            setReadOnly(false);
            setSelectedFormId(null);
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: error.message || "Error sending message.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card className="p-4 shadow-lg">
            <CardHeader>
                <h2 className="text-xl font-semibold text-primary">Send a Notification</h2>
                <p className="text-sm text-muted">Notify users with custom messages</p>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Recipients:</label>
                    <div className="flex flex-wrap">
                        {users?.map((user) => (
                            <div key={user.id} className="mr-4 mb-2">
                                <Checkbox
                                    id={`user-${user.id}`}
                                    checked={recipientIds.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setRecipientIds((prev) => [...prev, user.id]);
                                        } else {
                                            setRecipientIds((prev) => prev.filter((id) => id !== user.id));
                                        }
                                    }}
                                />
                                <label htmlFor={`user-${user.id}`} className="ml-2 text-sm">
                                    {user.username} ({user.email})
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium">Reference Form:</label>
                    <select
                        value={selectedFormId?.toString() || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedFormId(e.target.value ? Number(e.target.value) : null)}
                        className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                        aria-label="Select a reference form"
                    >
                        <option value="">-- Select a form (optional) --</option>
                        {forms?.map((form) => (
                            <option key={form.id} value={form.id.toString()}>
                                {form.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium">Content:</label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter your notification message"
                        rows={4}
                        className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                        aria-label="Notification message content"
                    />
                </div>

                <div className="mb-4 flex items-center">
                    <Checkbox
                        id="readOnlyCheckbox"
                        checked={readOnly}
                        onCheckedChange={(checked: boolean) => setReadOnly(checked)}
                    />
                    <label htmlFor="readOnlyCheckbox" className="ml-2 text-sm">
                        Read-Only
                    </label>
                </div>

                <Button
                    onClick={handleSendMessage}
                    disabled={loading || recipientIds.length === 0 || !content.trim()}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                    aria-label="Send Notification"
                >
                    {loading ? "Sending..." : "Send Notification"}
                </Button>
            </CardContent>
        </Card>
    );

};

export default SendMessage;

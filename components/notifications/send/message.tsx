"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppProvider";

const SendMessage: React.FC = () => {
    const { data, actions } = useAppContext();
    const { users, forms } = data;
    const { formActions, fetchAllUsers, messageActions } = actions;
    const { fetchAllForms } = formActions;

    const { sendMessageToUsers } = messageActions;

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
            alert("Please select at least one recipient.");
            return;
        }

        if (!content.trim()) {
            alert("Please enter a message.");
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
            alert("Message sent successfully");

            setRecipientIds([]);
            setContent("");
            setReadOnly(false);
            setSelectedFormId(null);
        } catch (error: any) {
            console.error("Error sending message:", error);
            alert(error.message || "Error sending message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Send a Notification</h2>
            <div className="mb-4">
                <label className="block mb-2">Recipients:</label>
                <select
                    multiple
                    value={recipientIds.map(String)}
                    onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions);
                        setRecipientIds(selectedOptions.map((option) => Number(option.value)));
                    }}
                    className="block w-full"
                >
                    {users?.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Reference Form:</label>
                <select
                    value={selectedFormId?.toString() || ""}
                    onChange={(e) =>
                        setSelectedFormId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="block w-full"
                >
                    <option value="">-- Select a form (optional) --</option>
                    {forms?.map((form) => (
                        <option key={form.id} value={form.id}>
                            {form.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">Content:</label>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your notification message"
                    rows={4}
                />
            </div>
            <div className="mb-4 flex items-center">
                <Checkbox
                    id="readOnlyCheckbox"
                    checked={readOnly}
                    onCheckedChange={(checked: boolean) => setReadOnly(checked)}
                />
                <label htmlFor="readOnlyCheckbox" className="ml-2">
                    Read-Only
                </label>
            </div>
            <Button
                onClick={handleSendMessage}
                disabled={loading || recipientIds.length === 0 || !content.trim()}
            >
                {loading ? "Sending..." : "Send Notification"}
            </Button>
        </div>
    );
};

export default SendMessage;

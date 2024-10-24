
"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppProvider";

interface ReplyMessageProps {
    messageId: number;
    onReplySent: () => void;
}

const ReplyMessage: React.FC<ReplyMessageProps> = ({ messageId, onReplySent }) => {
    const { actions } = useAppContext();
    const { messageActions } = actions;
    const { replyToMessage } = messageActions;

    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleReply = async () => {
        if (!content.trim()) {
            alert("Please enter a reply message.");
            return;
        }

        try {
            setLoading(true);
            await replyToMessage(messageId, content);
            alert("Reply sent successfully");
            setContent("");
            onReplySent();
        } catch (error: any) {
            console.error("Error sending reply:", error);
            alert(error.message || "Error sending reply");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <Textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                }
                placeholder="Type your reply here..."
                rows={3}
            />
            <Button
                onClick={handleReply}
                disabled={loading || !content.trim()}
                className="mt-2"
            >
                {loading ? "Sending..." : "Send Reply"}
            </Button>
        </div>
    );
};

export default ReplyMessage;

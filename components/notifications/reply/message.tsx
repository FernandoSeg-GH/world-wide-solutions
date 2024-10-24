"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppProvider";
import { useToast } from "@/components/ui/use-toast";

interface ReplyMessageProps {
    messageId: number;
    onReplySent: () => void;
}

const ReplyMessage: React.FC<ReplyMessageProps> = ({ messageId, onReplySent }) => {
    const { actions } = useAppContext();
    const { messageActions } = actions;
    const { replyToMessage } = messageActions;

    const { toast } = useToast();

    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleReply = async () => {
        if (!content.trim()) {
            toast({
                title: "Empty Reply",
                description: "Please enter a reply message.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await replyToMessage(messageId, content);
            toast({
                title: "Reply Sent",
                description: "Your reply has been sent successfully.",
                variant: "default",
            });
            setContent("");
            onReplySent();
        } catch (error: any) {
            console.error("Error sending reply:", error);
            toast({
                title: "Error",
                description: error.message || "Error sending reply.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <Textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Type your reply here..."
                rows={3}
                className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                aria-label="Type your reply"
            />
            <Button
                onClick={handleReply}
                disabled={loading || !content.trim()}
                className="mt-2 bg-primary hover:bg-primary-dark text-white"
                aria-label="Send Reply"
            >
                {loading ? "Sending..." : "Send Reply"}
            </Button>
        </div>
    );
};

export default ReplyMessage;

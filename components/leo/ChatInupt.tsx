import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLeoContext, ChatMessage } from "@/context/LeoProvider";
import { v4 as uuidv4 } from "uuid";

const ChatInput: React.FC = () => {
    const { addMessage } = useLeoContext();
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleSend = async () => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
            id: uuidv4(),
            sender: "user",
            content,
            timestamp: new Date(),
        };

        addMessage(userMessage);
        setContent("");
        setLoading(true);

        try {
            const response = await fetch(`/api/leo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: content,
                    max_tokens: 512,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const botMessage: ChatMessage = {
                id: uuidv4(),
                sender: "bot",
                content: data.response.trim(),
                timestamp: new Date(),
            };

            addMessage(botMessage);
        } catch (error: any) {
            console.error("Error fetching AI response:", error);
            const errorMessage: ChatMessage = {
                id: uuidv4(),
                sender: "bot",
                content: "Sorry, there was an error processing your request.",
                timestamp: new Date(),
            };
            addMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                onKeyPress={handleKeyPress}
                className="block w-full mt-1 border border-gray-300 rounded-md p-2"
                aria-label="Type your message"
                disabled={loading}
            />
            <Button
                onClick={handleSend}
                disabled={loading || !content.trim()}
                className="mt-2 bg-primary hover:bg-primary-dark text-white"
                aria-label="Send Message"
            >
                {loading ? "Sending..." : "Send"}
            </Button>
        </div>
    );
};

export default ChatInput;

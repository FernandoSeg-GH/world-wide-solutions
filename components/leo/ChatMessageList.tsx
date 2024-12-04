"use client";

import React, { useEffect, useRef } from "react";
import { useLeoContext } from "@/context/LeoProvider";
import ChatMessageItem from "./ChatMessageItem";

const ChatMessageList: React.FC = () => {
    const { messages } = useLeoContext();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatMessageList;

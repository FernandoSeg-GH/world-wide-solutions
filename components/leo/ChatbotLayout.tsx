"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInupt";


const ChatbotLayout: React.FC = () => {
    return (
        <div className="flex flex-col h-full w-full gap-4 flex-grow">
            <Card className="flex-1 p-4 shadow-lg overflow-auto dark:bg-card-dark dark:text-white">
                <ChatMessageList />
            </Card>
            <Card className="p-4 shadow-lg dark:bg-card-dark">
                <ChatInput />
            </Card>
        </div>
    );
};

export default ChatbotLayout;

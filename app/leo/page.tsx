"use client";

import React from "react";
import ChatbotLayout from "@/components/leo/ChatbotLayout";
import { ChatProvider } from "@/context/LeoProvider";

const ChatbotPage: React.FC = () => {
    return (
        <ChatProvider>
            <div className="h-screen w-full flex justify-center items-center bg-gray-100 dark:bg-gray-900 p-4">
                <div className="h-full w-full max-w-3xl">
                    <ChatbotLayout />
                </div>
            </div>
        </ChatProvider>
    );
};

export default ChatbotPage;

// "use client";

// import { useState } from "react";
// import { continueConversation, Message } from "@/actions";
// import { readStreamableValue } from "ai/rsc";

// export default function Home() {
//     const [conversation, setConversation] = useState<Message[]>([]);
//     const [input, setInput] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!input.trim()) return;

//         const userMessage: Message = { role: "user", content: input };
//         const updatedConversation = [...conversation, userMessage];
//         setConversation(updatedConversation);
//         setInput("");
//         setIsLoading(true);

//         const { newMessage } = await continueConversation(updatedConversation);
//         const assistantMessage = await readStreamableValue(newMessage) as unknown as string;
//         setConversation((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
//         setIsLoading(false);
//     };

//     return (
//         <div>
//             <div>
//                 {conversation.map((msg, index) => (
//                     <div key={index} className={msg.role === "user" ? "user-message" : "assistant-message"}>
//                         {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
//                     </div>
//                 ))}

//             </div>
//             <form onSubmit={handleSubmit}>
//                 <input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Type your message..."
//                     disabled={isLoading}
//                 />
//                 <button type="submit" disabled={isLoading || !input.trim()}>
//                     {isLoading ? "Sending..." : "Send"}
//                 </button>
//             </form>
//         </div>
//     );
// }

"use client";

import React, { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css"; // Optional theme

import { ChatMessage } from "@/context/LeoProvider";

interface ChatMessageItemProps {
    message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [message.content]);
    const language = message.content.match(/```(\w+)/)?.[1] || "javascript";

    const isCode = message.content.startsWith("```") && message.content.endsWith("```");
    const formattedContent = isCode ? message.content.slice(3, -3) : message.content;

    return (
        <div className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-lg p-3 rounded-md ${message.sender === "user"
                    ? "bg-blue-100 text-right dark:bg-blue-700 dark:text-white"
                    : "bg-gray-200 text-left dark:bg-gray-800 dark:text-white"
                    }`}
            >
                {isCode ? (
                    <pre>
                        <code className={`language-${language}`}>{formattedContent}</code>
                    </pre>
                ) : (
                    <p>{message.content}</p>
                )}
                <small className="text-gray-500">
                    {message.timestamp.toLocaleString()}
                </small>
            </div>
        </div>
    );
};

export default ChatMessageItem;


// "use client";

// import React from "react";
// import { ChatMessage } from "@/context/LeoProvider";

// interface ChatMessageItemProps {
//     message: ChatMessage;
// }

// const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
//     return (
//         <div
//             className={`flex mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"
//                 }`}
//         >
//             <div
//                 className={`max-w-lg p-3 rounded-md ${message.sender === "user"
//                     ? "bg-blue-100 text-right dark:bg-blue-700 dark:text-white"
//                     : "bg-gray-200 text-left dark:bg-gray-800 dark:text-white"
//                     }`}
//             >
//                 <p>{message.content}</p>
//                 <small className="text-gray-500">
//                     {message.timestamp.toLocaleString()}
//                 </small>
//             </div>
//         </div>
//     );
// };

// export default ChatMessageItem;

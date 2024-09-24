// components/ui/Search.tsx
"use client";

import { useState } from "react";
import { Button } from "./button";

interface SearchProps {
    onSubmit: (query: string) => void;
    placeholder?: string;
}

export function Search({ onSubmit, placeholder = "Enter case ID..." }: SearchProps) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                className="border border-gray-300 rounded p-2 w-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
            />
            <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                Search
            </Button>
        </div>
    );
}

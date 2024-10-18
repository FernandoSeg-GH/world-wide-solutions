
'use client';

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppContext } from "@/context/AppProvider";
import RenderComponent from "@/lib/renderComponent";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data } = useAppContext();
    const { currentSection } = data;


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <div className={`flex p-4 h-auto w-full flex-col gap-6 transition-all duration-300 ${isExpanded ? "sm:pl-64" : "sm:pl-14"}`}>
                <Header
                    currentSection={currentSection}
                    isExpanded={isExpanded}
                // breadcrumbs={mockData.breadcrumbs} 
                />
                <div className="px-4">
                    {RenderComponent(currentSection)}
                </div>
            </div>
        </div>
    );
}


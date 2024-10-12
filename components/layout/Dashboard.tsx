
'use client';

import { useState } from "react";
import Welcome from "@/components/user/Welcome";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import Main from "./Main";
import { useAppContext } from "@/context/AppContext";
import Businesses from "../business/Businesses";
import Forms from "../forms/Forms";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data } = useAppContext();
    const { currentSection } = data; // Get the current section

    const renderComponent = () => {
        switch (currentSection) {
            case "Dashboard":
                return <Main />;
            case "Forms":
                return <Forms />;
            case "Submissions":
                return <p>Submissions Component</p>;
            case "Notifications":
                return <p>Notifications</p>;
            case "Businesses":
                return <Businesses />;
            case "AI Characters":
                return <p>AI Characters</p>;
            default:
                return <p>Select a section</p>;
        }
    };
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
            />
            <div className={`flex p-4 h-auto w-full flex-col gap-6 transition-all duration-300 ${isExpanded ? "sm:pl-64" : "sm:pl-14"}`}>
                <Header currentSection={currentSection}
                // breadcrumbs={mockData.breadcrumbs} 
                />
                <div className="p-4">
                    {renderComponent()}
                </div>
            </div>
        </div>
    );
}


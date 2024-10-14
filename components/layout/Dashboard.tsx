
'use client';

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import Main from "./Main";
import { useAppContext } from "@/context/AppProvider";
import Businesses from "@/components/business";
import Forms from "@/components/business/forms";
import Submissions from "@/components/business/forms/submissions";
import Notifications from "@/components/business/notifications";
import Leo from "@/components/leo";
import Vinci from "@/components/vinci/Vinci";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data } = useAppContext();
    const { currentSection } = data;

    const renderComponent = () => {
        switch (currentSection) {
            case "Dashboard":
                return <Main />;
            case "Forms":
                return <Forms />;
            case "Submissions":
                return <Submissions />;
            case "Notifications":
                return <Notifications />;
            case "Businesses":
                return <Businesses />;
            case "AI Characters":
                return <Leo />;
            case "Vinci":
                return <Vinci />;
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


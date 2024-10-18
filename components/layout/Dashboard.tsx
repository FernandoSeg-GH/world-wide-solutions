"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { Header } from "./Header";
import { useAppContext } from "@/context/AppProvider";
import RenderComponent from "@/lib/renderComponent";
import { cn } from "@/lib/utils";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data } = useAppContext();
    const { currentSection } = data;

    const [isMobile, setIsMobile] = useState(false);

    // Effect to update isMobile state based on window width
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
        };
        handleResize(); // Check on mount
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {!isMobile && (
                <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            )}
            {isMobile && <MobileNavbar />}

            <div
                className={cn(
                    "flex flex-col gap-6 transition-all duration-300 w-full",
                    isMobile ? "m-0 p-0 px-4 mt-16 " : "",
                    isExpanded && !isMobile ? " p-4 pl-64" : "p-4 pl-16"
                )}
            >
                <Header
                    currentSection={currentSection}
                    isExpanded={isExpanded}
                // breadcrumbs={mockData.breadcrumbs}
                />
                <div className="">{RenderComponent(currentSection)}</div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import { Header } from "./Header";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "../ui/spinner";
import Forms from "../business/forms";
import Submissions from "../business/forms/submissions";
import Notifications from "../business/notifications/Notifications";
import Main from "./Main";
import Businesses from "../business";
import Leo from "../leo";
import Vinci from "../vinci/Vinci";
import FormDetails from "../business/forms/FormDetails";

export const RenderComponent = (currentSection: string) => {
    const url = usePathname();
    if (url === "/submit") {
        return (
            <Suspense fallback={<div><Spinner /></div>}>
                <Forms />
                <Submissions />
                <Notifications />
            </Suspense>
        );
    }


    switch (currentSection) {
        case "Dashboard":
            return <Main />;
        case "Forms":
            return <Forms />;
        case "FormDetail":
            return <FormDetails />;
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
            return <Forms />;
    }
};

export function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(true);
    const { data } = useAppContext();
    const { currentSection } = data;

    const [isMobile, setIsMobile] = useState(false);
    const { data: session } = useSession()

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    return (

        <div className="flex min-h-screen w-full flex-col bg-muted/10">
            {!isMobile && (
                <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            )}
            {isMobile && <MobileNavbar />}

            <div
                className={cn(
                    "flex flex-col gap-6 transition-all duration-300 max-w-screen p-4",
                    isMobile ? "m-0 p-0 px-4 mt-16 " : "",
                    isExpanded && !isMobile ? "pl-64" : "pl-14"
                )}
            >
                <Header
                    currentSection={currentSection}
                    isExpanded={isExpanded}
                // breadcrumbs={mockData.breadcrumbs}
                />
                <div className="pl-4">{RenderComponent(currentSection)}</div>
            </div>
        </div>
    );
}

export default Dashboard
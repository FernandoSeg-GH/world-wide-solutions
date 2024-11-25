'use client';

import { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import { MobileNavbar } from "@/components/layout/navbar/MobileNavbar";
import { Header } from "@/components/layout/navbar/Header";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "@/components/ui/spinner";
import Forms from "@/components/business/forms";
import Submissions from "@/components/business/forms/submissions";
import Notifications from "@/components/business/notifications/Notifications";
import Main from "./Main";
import Businesses from "@/components/business";
import Leo from "@/components/leo";
import Vinci from "@/components/vinci/Vinci";
import FormDetails from "@/components/business/forms/FormDetails";
import Users from "@/components/users";
import MessagingLayout from "../notifications/MessagingLayout";
import ClaimReports from "../business/forms/custom/ClaimReports";

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
        case "Claim Reports":
            return <ClaimReports />;
        case "Forms":
            return <Forms />;
        case "Form":
            return <FormDetails />;
        case "Submissions":
            return <Submissions />;
        case "Messages":
            return <MessagingLayout />;
        case "Users":
            return <Users />;
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
    const { data: session } = useSession();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col bg-gray-200 dark:bg-muted-dark/20">
            {!isMobile && (
                <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            )}
            {isMobile && <MobileNavbar />}

            <div
                className={cn(
                    "flex flex-col items-end transition-all duration-300 w-full max-w-[100vw] overflow-hidden h-full",
                    isMobile ? "p-2" : "",
                    isExpanded && !isMobile && "pl-64",
                    !isExpanded && !isMobile && "pl-16"
                )}
            >
                <Header
                    currentSection={currentSection}
                    isExpanded={isExpanded}
                />
                <div className="flex-grow overflow-y-auto w-full  overflow-hidden  no-scrollbar px-8 py-6">{RenderComponent(currentSection)}</div>
            </div>
        </div>
    );
}

export default Dashboard;

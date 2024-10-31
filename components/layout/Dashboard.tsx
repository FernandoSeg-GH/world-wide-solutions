"use client";

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
        case "Form":
            return <FormDetails />;
        case "Submissions":
            return <Submissions />;
        // case "Notifications":
        //     return <Notifications />;
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

        <div className="flex h-screen w-full flex-col bg-muted/10">
            {!isMobile && (
                <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            )}
            {isMobile && <MobileNavbar />}

            <div
                className={cn(
                    "flex flex-col gap-6 transition-all duration-300 max-w-screen overflow-hidden p-4 h-[100%]",
                    isMobile ? "m-0 p-0 px-4 mt-16 " : "",
                    isExpanded && !isMobile ? "pl-64" : "pl-14"
                )}
            >
                <Header
                    currentSection={currentSection}
                    isExpanded={isExpanded}
                // breadcrumbs={mockData.breadcrumbs}
                />
                <div className="pl-4 h-full flex flex-col items-start justify-start flex-grow w-full overflow-auto overflow-x-hidden">{RenderComponent(currentSection)}</div>
            </div>
        </div>
    );
}

export default Dashboard
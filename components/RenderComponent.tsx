"use client";
import { usePathname } from "next/navigation";
import Businesses from "@/components/business";
import Forms from "@/components/business/forms";
import Submissions from "@/components/business/forms/submissions";
import Notifications from "@/components/business/notifications";
import Main from "@/components/layout/Main";
import Leo from "@/components/leo";
import Vinci from "@/components/vinci/Vinci";
import { Suspense } from "react";
import Spinner from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import AdminNotifications from "./business/notifications/AdminNotifications";

export const RenderComponent = (currentSection: string) => {
    const url = usePathname();
    const { data: session } = useSession()
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

export default RenderComponent
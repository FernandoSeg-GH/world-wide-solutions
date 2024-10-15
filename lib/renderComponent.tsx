"use client";
import { usePathname } from "next/navigation";
import Businesses from "@/components/business";
import Forms from "@/components/business/forms";
import Submissions from "@/components/business/forms/submissions";
import Notifications from "@/components/business/notifications";
import Main from "@/components/layout/Main";
import Leo from "@/components/leo";
import Vinci from "@/components/vinci/Vinci";

export const renderComponent = (currentSection: string) => {
    const url = usePathname();

    if (url === "/submit") {
        return (
            <>
                <Forms />
                <Submissions />
                <Notifications />
            </>
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

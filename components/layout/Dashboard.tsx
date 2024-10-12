
'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { mockData } from "../../lib/mock-data";
import BusinessesTable from "../business/BusinessesTable";
import { useGodMode } from "@/hooks/useGodMode";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { fetchForms } = actions;

    // useEffect(() => {
    //     if (session?.user?.businessId) {
    //         fetchForms(session.user.businessId);
    //     }
    // }, [session, fetchForms]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                sidebarItems={mockData.sidebarItems}
            />
            <div className={`flex p-4 h-auto w-full flex-col gap-6 transition-all duration-300 ${isExpanded ? "sm:pl-64" : "sm:pl-14"}`}>
                <Header
                // breadcrumbs={mockData.breadcrumbs} 
                />
                <Welcome />
                {godMode ? (
                    <div className="w-full flex flex-col gap-6 px-4">
                        <CreateBusinessForm />
                        <BusinessesTable />

                    </div>
                ) : null}


            </div>
        </div>
    );
}


'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "../business/BusinessesTable";
import { useGodMode } from "@/hooks/user/useGodMode";
import Stats from "../business/stats";
import BusinessStats from "../business/stats/BusinessStats";

export default function Main() {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { formActions } = actions;

    useEffect(() => {
        if (session?.user?.businessId) {
            formActions.fetchFormsByBusinessId(session.user.businessId);
        }
    }, [session]);
    useEffect(() => {
        if (form) {
            console.log('form', form)
        }
    }, [form]);

    return (
        <div className="flex h-full w-full flex-col bg-muted/40">
            <Welcome />
            {godMode ? (
                <div className="w-full flex flex-col gap-6 px-4">
                    <BusinessStats />
                    {/* <Stats />  */}

                    <CreateBusinessForm />
                    <BusinessesTable />

                </div>
            ) : (
                <p className="text-center">You do not have access to this view.</p>
            )}
        </div>
    );
}

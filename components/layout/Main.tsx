'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "@/components/business/BusinessesTable";
import { useGodMode } from "@/hooks/user/useGodMode";
import BusinessStats from "@/components/business/stats/BusinessStats";
import Forms from "@/components/business/forms";
import { Separator } from "@/components/ui/separator";

export default function Main() {
    const { godMode } = useGodMode();

    return (
        <div className="flex h-full w-full flex-col bg-muted/40">
            <Welcome />
            <div className="w-full flex flex-col gap-6 p-4">
                <BusinessStats />
                {/* <Stats />  */}
                <Separator className="border-gray-400 my-2" />

                <Forms />

                {!godMode ? null : <BusinessesTable />}
                {!godMode ? null : <CreateBusinessForm />}


            </div>
        </div>
    );
}

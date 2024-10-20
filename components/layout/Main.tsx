'use client';
import SectionHeader from "@/components/layout/navbar/SectionHeader";;
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "@/components/business/BusinessesTable";
import { useGodMode } from "@/hooks/user/useGodMode";
import BusinessStats from "@/components/business/stats/BusinessStats";
import Forms from "@/components/business/forms";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect } from "react";

export default function Main() {
    const { godMode } = useGodMode();

    return (
        <div className="flex h-full w-full flex-col text-black dark:text-white">

            <SectionHeader
                title={<p className="capitalize">Welcome!</p>}
                subtitle="This is your personal dashboard. Follow up and check on your activity."
            />
            <div className="w-full flex flex-col gap-6 mt-4">
                <BusinessStats />
                {/* <Stats />  */}
                <Separator className="border-gray-400 my-3" />

                <Forms />

                {!godMode ? null : <BusinessesTable />}
                {!godMode ? null : <CreateBusinessForm />}


            </div>
        </div>
    );
}

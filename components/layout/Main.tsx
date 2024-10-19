'use client';
import SectionHeader from "@/components/layout/SectionHeader";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "@/components/business/BusinessesTable";
import { useGodMode } from "@/hooks/user/useGodMode";
import BusinessStats from "@/components/business/stats/BusinessStats";
import Forms from "@/components/business/forms";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

export default function Main() {
    const { godMode } = useGodMode();
    const { data: session, status } = useSession();

    return (
        <div className="flex h-full w-full flex-col bg-muted/40">

            <SectionHeader
                title={<p>Welcome <span className="capitalize">{session?.user.name}</span>!</p>}
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

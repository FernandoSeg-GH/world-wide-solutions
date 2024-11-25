'use client';
import SectionHeader from "@/components/layout/navbar/SectionHeader";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "@/components/business/BusinessesTable";
import { useGodMode } from "@/hooks/user/useGodMode";
import BusinessStats from "@/components/business/stats/BusinessStats";
import Forms from "@/components/business/forms";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect } from "react";
import { roleId } from "@/context/globals";
import Submissions from "../business/forms/submissions";
import ClaimReports from "../business/forms/custom/ClaimReports";
import AccidentClaimsView from "../business/forms/custom/accident-claim/AccidentClaimsView";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'

export default function Main() {
    const { godMode } = useGodMode();
    const { data: session } = useSession();
    const router = useRouter()

    return (
        <div className="flex h-full w-full  max-w-screen overflow-x-hidden  flex-col text-black dark:text-white">
            <SectionHeader
                title={<p className="capitalize">Welcome {session?.user.name}!</p>}
                subtitle="This is your personal dashboard. Follow up and check on your activity."
            />
            {/* <Separator className="border-gray-400 my-3" /> */}
            <div className="flex flex-col gap-6 mt-4">
                <BusinessStats />
                {session?.user.role.id === 4 && (
                    <Forms />
                )}
                {session?.user.role.id === 4 && (
                    <Submissions />
                )}
                {session?.user.role.id === 3 && (
                    <ClaimReports />
                )}
                {session?.user.role.id === 3 && (
                    <AccidentClaimsView />
                )}
                {/* {session?.user.role.id === 1 && (
                    <Submissions />
                )} */}
                {session?.user.role.id === 1 &&
                    <Card>
                        <CardHeader>
                            <CardTitle>Accident Claim Report</CardTitle>
                            <p>   Submit a new Accident Claim Report  </p>
                        </CardHeader>
                        <CardDescription className='px-6 pb-6 flex justify-end'>
                            <Button onClick={() => router.push("/accident-claim")}>New Claim <PlusCircle /></Button>
                        </CardDescription>
                    </Card>
                }
                {session?.user.role.id === 1 && (
                    <AccidentClaimsView />
                )}
                {!godMode ? null : <BusinessesTable />}
                {!godMode ? null : <CreateBusinessForm />}
            </div>
        </div>
    );
}

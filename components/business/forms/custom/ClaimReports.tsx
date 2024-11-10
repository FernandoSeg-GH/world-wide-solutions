"use client"
import React from 'react'
// import AccidentClaimsView from './AccidentClaimView'
import AccidentClaimForm from './AccidentClaimForm'
import AccidentClaimsView from './accident-claim/AccidentClaimsView'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'
import SectionHeader from '@/components/layout/navbar/SectionHeader'

type Props = {}

function ClaimReports({ }: Props) {
    const { data: session } = useSession()
    const router = useRouter()

    return (
        <div className='flex flex-col gap-4'>
            <SectionHeader
                title={<p className="capitalize">Claim Reports Area</p>}
                subtitle="View your submitted claims, and update with any new documentation."
            />
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
            <AccidentClaimsView />
            {/* <AccidentClaimsView /> */}
            {/* <AccidentClaimForm /> */}
        </div>
    )
}

export default ClaimReports
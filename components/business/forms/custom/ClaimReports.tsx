"use client"
import React from 'react'
import AccidentClaimsView from './accident-claim/AccidentClaimsView'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react'
import SectionHeader from '@/components/layout/navbar/SectionHeader'
import AccidentClaimForm from './accident-claim/AccidentClaimForm'

type Props = {}

function ClaimReports({ }: Props) {
    const { data: session } = useSession()
    const [expanded, setExpanded] = React.useState(false)

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
            {session?.user.role.id === 1 &&
                <AccidentClaimsView />
            }
            {session?.user.role.id === 3 &&
                <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow'>
                    {/* <AccidentClaimForm/> */}

                    <Button variant="ghost" onClick={() => setExpanded(!expanded)} className='font-semibold text-lg w-full'>
                        1) Accident Claim Report {expanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                    {expanded &&
                        <div className='w-full flex flex-col gap-6'>
                            <h3 className='text-lg font-semibold text-center'>Submit a new Accident Claim Report:</h3>
                            <AccidentClaimForm />
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default ClaimReports
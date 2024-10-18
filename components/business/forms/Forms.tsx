
'use client';
import React from 'react'

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect, useState } from "react";
import { useGodMode } from "@/hooks/user/useGodMode";
import FormCards from "@/components/business/forms/FormCards";
import SubmissionFormCard from "@/components/business/forms/submissions/SubmissionFormCard";
import SubmissionsTable from "@/components/business/forms/submissions/SubmissionTable";
import ClientView from './ClientView';
import Spinner from '@/components/ui/spinner';
import SectionHeader from '@/components/layout/SectionHeader';
import { Separator } from '@radix-ui/react-select';

type Props = {}

function Forms({ }: Props) {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { formActions } = actions;

    useEffect(() => {
        // Check if session and role are available before triggering fetches
        if (session?.user?.role?.id === 4) {
            // Fetch all forms in godMode (Superadmin)
            formActions.fetchAllForms();
        } else if (session?.user?.businessId && session?.user?.role?.id === 3) {
            // Fetch forms for the current business
            formActions.fetchFormsByBusinessId(session.user.businessId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.role?.id, session?.user?.businessId]);


    if (loading) {
        return <div><Spinner /></div>;
    }
    return (
        <div className='px-4'>
            <SectionHeader
                title={` Forms`}
                subtitle="Create and Manage your business forms to collect data."
            />
            <Separator className='my-2 mb-6' />
            <div className="w-full flex flex-col gap-6">
                {
                    forms && forms.length > 0 ?
                        <FormCards forms={forms} />
                        : forms.length === 0 ? <p>No Forms Available.</p> : null
                }

                {/* {forms && forms.length > 0 && session?.user.role.id === 1 ?
                    <SubmissionFormCard forms={forms} />

                    : <p>No Submissions Form Card Available.</p>} */}

                {/* {forms && forms.length > 0 ?
                    forms.map((form, index) =>
                        <SubmissionsTable key={index} form={form} submissions={submissions} admin />
                    )

                    : <p> No SubmissionsTable Available.</p>} */}

                {forms && session?.user.role.id === 1 ?
                    forms.map((form, index) =>
                        <ClientView key={index} form={form} submissions={submissions ?? []} />
                    ) : null}


                {/* <div className="w-full">
                    {forms && session?.user.role.id !== 1 ? (
                        <div className="">
                            <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>

                            <FormCards forms={forms} />
                        </div>
                    ) : <SubmissionFormCard forms={forms} />
                    }
                </div> */}
                {/* <div className="flex flex-col gap-6 w-full">
                    <div>
                        {form && session?.user.role.id !== 1 && forms && submissions ?
                            forms.map((form, index) =>
                                <SubmissionsTable key={index} form={form} submissions={submissions} admin />
                            )
                            : null
                        }
                    </div>
                    <div className="w-full">
                        {form ?
                            <ClientView form={form} submissions={submissions ?? []} />
                            : null
                        }
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default Forms
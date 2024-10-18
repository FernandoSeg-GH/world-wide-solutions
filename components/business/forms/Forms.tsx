
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
import CreateFormBtn from './CreateFormButton';
import { Skeleton } from '@/components/ui/skeleton';
import FormCard from './FormCard';
import { Separator } from '@/components/ui/separator';

type Props = {}

function Forms({ }: Props) {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { formActions } = actions;

    useEffect(() => {
        if (session?.user?.role?.id === 4) {
            formActions.fetchAllForms();
        } else if (session?.user?.businessId && session?.user?.role?.id === 3) {
            formActions.fetchFormsByBusinessId(session.user.businessId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.role?.id, session?.user?.businessId]);


    if (loading) {
        return <div><Spinner /></div>;
    }
    return (
        <div className=''>
            <SectionHeader
                title={` Forms`}
                subtitle="Create and Manage your business forms to collect data."
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="w-full flex flex-col gap-6">
                {/* {
                    forms && forms.length > 0 ?
                        <FormCards forms={forms} />
                        : forms.length === 0 ? <p>No Forms Available.</p> : null
                } */}
                {!loading && session?.user.role.id !== 1 ?
                    <CreateFormBtn /> : null
                }
                {loading ? <Skeleton className="border-2 border-primary-/20 h-[210px] w-full lg:max-w-[380px]" /> : null}
                {forms && forms.length > 0 ? forms.map((form) => (
                    <FormCard key={form.id} form={form} />
                )) : null}
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
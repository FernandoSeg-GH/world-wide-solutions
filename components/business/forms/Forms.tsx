
'use client';
import React from 'react'

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect, useState } from "react";
import { useGodMode } from "@/hooks/useGodMode";
import FormCards from "@/components/business/forms/FormCards";
import SubmissionFormCard from "@/components/business/forms/submissions/SubmissionFormCard";
import SubmissionsTable from "@/components/business/forms/submissions/SubmissionTable";
import ClientView from './ClientView';

type Props = {}

function Forms({ }: Props) {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { fetchAllForms, fetchFormsByBusinessId } = actions;

    useEffect(() => {
        if (godMode) {
            fetchAllForms();
        } else if (session?.user?.businessId) {
            fetchFormsByBusinessId(session.user.businessId);
        }
    }, [godMode, session?.user.businessId, fetchAllForms, fetchFormsByBusinessId]);

    useEffect(() => {
        if (forms.length > 0) {
            console.log('forms', forms)
        }
    }, [forms])
    return (
        <div>
            <div className="w-full flex flex-col gap-6">
                {forms && forms.length > 0 ?
                    <FormCards forms={forms} />
                    : <p>No Forms Available.</p>}

                {forms && forms.length > 0 ?
                    <SubmissionFormCard forms={forms} />

                    : <p>No Submissions Form Card Available.</p>}

                {forms && forms.length > 0 ?
                    forms.map((form, index) =>
                        <SubmissionsTable key={index} form={form} submissions={submissions} admin />
                    )

                    : <p> No SubmissionsTable Available.</p>}

                {forms ?
                    forms.map((form, index) =>
                        <ClientView key={index} form={form} submissions={submissions ?? []} />
                    )

                    : <p> No ClientView Available.</p>}


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
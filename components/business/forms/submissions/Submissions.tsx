"use client"
import React, { useEffect } from 'react'
import SubmissionFormCard from './SubmissionFormCard';
import SubmissionsTable from './SubmissionTable';
import ClientView from '../ClientView';
import { useSession } from 'next-auth/react';
import { useGodMode } from '@/hooks/useGodMode';
import { useAppContext } from '@/context/AppProvider';

type Props = {}

function Submissions({ }: Props) {
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

    return (
        <div>
            <div className="w-full flex flex-col gap-6">
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

            </div>
        </div>
    )
}


export default Submissions
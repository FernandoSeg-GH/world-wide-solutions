
'use client';
import React from 'react'

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect, useState } from "react";
import { useGodMode } from "@/hooks/user/useGodMode";
import SubmissionFormCard from "@/components/business/forms/submissions/SubmissionFormCard";
import SubmissionsTable from "@/components/business/forms/submissions/SubmissionTable";
import ClientView from './ClientView';
import Spinner from '@/components/ui/spinner';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
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
        <div className='text-black dark:text-white'>
            <SectionHeader
                title={` Forms`}
                subtitle="Create and Manage your business forms to collect data."
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="w-full flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {!loading && session?.user.role.id !== 1 ? (
                        <CreateFormBtn />
                    ) : null}

                    {loading ? (
                        <Skeleton className="border-2 border-primary/20 h-[210px] w-full lg:max-w-[380px]" />
                    ) : null}

                    {forms && forms.length > 0 ? (
                        forms.map((form) => <FormCard key={form.id} form={form} />)
                    ) : null}
                </div>

                {forms && session?.user.role.id === 1 ?
                    forms.map((form, index) =>
                        <ClientView key={index} form={form} submissions={submissions ?? []} />
                    ) : null}
            </div>
        </div>
    )
}

export default Forms
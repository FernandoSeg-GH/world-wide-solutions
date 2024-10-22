'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useGodMode } from "@/hooks/user/useGodMode";
import ClientView from './ClientView';
import Spinner from '@/components/ui/spinner';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import CreateFormBtn from './CreateFormButton';
import { Skeleton } from '@/components/ui/skeleton';
import FormCard from './FormCard';
import { Separator } from '@/components/ui/separator';
import { AppContextType } from '@/types';

interface Props { }

function Forms({ }: Props) {
    const { data: session, status } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext() as AppContextType;
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { formActions } = actions;

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (session?.user?.role?.id === 4) {
                    await formActions.fetchAllForms();
                } else if (session?.user?.businessId && session?.user?.role?.id === 3) {
                    await formActions.fetchFormsByBusinessId(Number(session.user.businessId));
                }
                else if (session?.user?.role?.id === 1) {
                    await formActions.fetchPublishedFormsByBusinessId(Number(session.user.businessId));
                }
            } catch (error) {
                console.error("Failed to fetch forms:", error);
                setError("Failed to load your forms. Please try again later.");
            }
        };

        if (status === 'authenticated') {
            fetchData();
        }
    }, [
        session?.user?.role?.id,
        session?.user?.businessId,
        status,
        formActions.fetchAllForms,
        formActions.fetchFormsByBusinessId,
        formActions.fetchPublishedFormsByBusinessId
    ]);

    if (loading) {
        return <div><Spinner /></div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className='text-black dark:text-white'>
            <SectionHeader
                title={` Forms`}
                subtitle="Create and Manage your business forms to collect data."
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="w-full flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4">
                    {session?.user.role.id !== 1 && (
                        <CreateFormBtn />
                    )}

                    {loading && (
                        <Skeleton className="border-2 border-primary/20 h-[210px] w-full lg:max-w-[380px]" />
                    )}

                    {forms && forms.length > 0 ? (
                        forms.map((form) => <FormCard key={form.id} form={form} />)
                    ) : (
                        <div className="text-center text-gray-500">
                            {session?.user.role.id !== 1
                                ? "No forms available. Create a new form to get started!"
                                : "You have no forms available. Please contact your administrator."
                            }
                        </div>
                    )}
                </div>

                {forms && session?.user.role.id === 1 && (
                    forms.map((form) =>
                        <ClientView key={form.id} form={form} submissions={submissions?.filter(sub => sub.formId === form.id) ?? []} />
                    )
                )}
            </div>
        </div>
    )
}

export default Forms;

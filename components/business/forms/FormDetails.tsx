// components/business/forms/FormDetails.tsx
"use client";
import React from 'react';
import { useAppContext } from '@/context/AppProvider';
import SectionHeader from "@/components/layout/SectionHeader";
import SubmissionsTable from './submissions/SubmissionTable';
import ClientView from './ClientView';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';

const FormDetails = () => {
    const { data } = useAppContext();
    const { form, submissions } = data;
    const { data: session } = useSession()
    if (!form) {
        return <div>No form selected.</div>;
    }
    const admin = session?.user.role.id === 4 || session?.user.role.id === 3
    return (
        <div className="flex flex-col gap-6">
            <SectionHeader
                title={`Form: ${form.name}`}
                subtitle={`${form.description}` || ""}
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            {/* You can add any additional form details or actions here */}
            {/* For example, display submissions related to this form */}
            <SubmissionsTable admin={admin} form={form} />
            {/* Or display a client view */}
            <ClientView form={form} submissions={submissions ?? []} />
        </div>
    );
};

export default FormDetails;

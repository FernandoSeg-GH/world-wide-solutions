"use client";

import React from 'react';
import { useAppContext } from '@/context/AppProvider';
import SectionHeader from "@/components/layout/SectionHeader";
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import SubmissionCard from './submissions/SubmissionCard';
import SubmissionsTable from './submissions/SubmissionTable';
import ClientView from './ClientView';

const FormDetails = () => {
    const { data } = useAppContext();
    const { form, submissions } = data;
    const { data: session } = useSession();

    if (!form) {
        return <div>No form selected.</div>;
    }

    // Check if the user has admin rights
    const isAdmin = session?.user.role.id === 4 || session?.user.role.id === 3;

    // Create a fieldMap for form fields
    const fieldMap = form.fields?.reduce((acc, field) => {
        acc[field.id] = field.extraAttributes?.label || field.id;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="flex flex-col gap-6">
            <SectionHeader
                title={`Form: ${form.name}`}
                subtitle={form.description ? `Description: ${form.description}` : "-"}
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <SubmissionsTable form={form} admin={isAdmin} />
            {/* <ClientView /> */}
            {/* Render submission cards */}
            <div className="grid grid-cols-1 gap-4">
                {submissions.map((submission) => {
                    let contentParsed: Record<string, any> = {};

                    // Parse submission content
                    if (submission.content) {
                        try {
                            contentParsed = JSON.parse(String(submission.content));
                        } catch (error) {
                            console.error(`Error parsing content for submission ID ${submission.id}:`, error);
                        }
                    }

                    // Render each submission using SubmissionCard
                    return (
                        <SubmissionCard
                            key={submission.id}
                            submission={submission}
                            contentParsed={contentParsed}
                            form={form}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default FormDetails;

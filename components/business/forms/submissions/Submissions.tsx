"use client"
import React, { useEffect, useState, useMemo } from "react";
import Spinner from '@/components/ui/spinner';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import { useAppContext } from '@/context/AppProvider';
import { ElementsType, Form, Submission } from '@/types';
import SubmissionCard from "./SubmissionCard";
import { useFormState } from "@/hooks/forms/useFormState";

export function useFieldMapping(form: Form, submission: { [key: string]: any } = {}) {
    const { fieldMap, fieldKeys } = useMemo(() => {
        const fields = Array.isArray(form.fields) ? form.fields : [];

        const map: {
            [key: string]: {
                label: string;
                type: ElementsType;
                value: any;
                extraAttributes?: any;
            };
        } = {};
        const keys: string[] = [];

        fields.forEach((field) => {
            const fieldId = field.id.toString();
            const fieldLabel = field.extraAttributes?.label || `Field ${fieldId}`;
            let fieldValue = "N/A";

            // Use the fieldId directly to fetch the corresponding value from submission
            if (submission.content && submission.content[fieldId] !== undefined) {
                fieldValue = submission.content[fieldId];
            } else if (submission.content) {
                // Additional fallback based on labels (if needed)
                const matchingKey = Object.keys(submission.content).find(
                    (key) => submission.content[key] === fieldLabel
                );
                fieldValue = matchingKey ? submission.content[matchingKey] : "N/A";
            }

            map[fieldId] = {
                label: fieldLabel,
                type: field.type,
                value: fieldValue,
                extraAttributes: field.extraAttributes,
            };

            keys.push(fieldId);
        });

        return { fieldMap: map, fieldKeys: keys };
    }, [form.fields, submission]);

    return { fieldKeys, fieldMap };
}



function Submissions() {
    const { data: session } = useSession();
    const { loading, submissionsForms, fetchUserSubmissionsWithForms } = useSubmissions();

    // Only fetch once
    useEffect(() => {
        const fetchUserSubmissions = async () => {
            if (session?.user.role?.id === 1) {
                try {
                    await fetchUserSubmissionsWithForms();
                } catch (error) {
                    console.error("Error fetching submissions:", error);
                }
            }
        };
        fetchUserSubmissions();
    }, [session?.user.role?.id, fetchUserSubmissionsWithForms]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-screen h-screen">
                <Spinner />
            </div>
        );
    }

    // Ensure submissions are only displayed once
    const hasSubmissions = Object.keys(submissionsForms).length > 0;

    if (!hasSubmissions) {
        return <p>No submissions found.</p>;
    }

    return (
        <div className="text-black dark:text-white w-full">
            <SectionHeader title="My Submissions"
            // subtitle="View Accident Claim Report Submissions." 
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="mb-12 w-full">
                {Object.entries(submissionsForms).map(([formId, formData]) => (
                    <div key={formId} className="mb-8">
                        {/* Form Title */}
                        <h2 className="text-lg font-bold mb-4">{formData.form.name}</h2>
                        {/* Submissions List */}
                        <div className="flex flex-row gap-4">
                            {formData.submissions.length > 0 ? (
                                formData.submissions.map((submission: Submission) => (
                                    <SubmissionCard
                                        key={submission.id}
                                        submission={submission}
                                        form={formData.form}
                                    />
                                ))
                            ) : (
                                <p>No submissions for this form.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Submissions;

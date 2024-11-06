"use client"
import React, { useEffect, useState, useMemo } from "react";
import Spinner from '@/components/ui/spinner';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import { useAppContext } from '@/context/AppProvider';
import { ElementsType, Form, Submission } from '@/types';

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
    const { loading, setLoading, setSubmissions } = useSubmissions();
    const { data } = useAppContext();
    const { form, submissions } = data;

    useEffect(() => {
        const fetchUserSubmissions = async () => {
            if (form && session?.user.role?.id && form.shareUrl) {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/forms/${session.user.businessId}/share-url/${form.shareUrl}/submissions`);
                    if (!response.ok) throw new Error("Failed to fetch submissions");

                    // Specify the type for `data` and `data.submissions`
                    const data: { submissions: Submission[] } = await response.json();

                    if (data.submissions && Array.isArray(data.submissions)) {
                        const filteredSubmissions = data.submissions.filter((sub: Submission) => sub.formId === form.id);
                        setSubmissions(filteredSubmissions);
                    } else {
                        console.error("Invalid data structure:", data);
                    }
                } catch (error) {
                    console.error("Error fetching submissions:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserSubmissions();
    }, [form, session?.user.businessId, session?.user.role?.id, setLoading, setSubmissions]);


    if (loading) {
        return <Spinner />;
    }

    if (!form) return <p>No form found.</p>;

    return (
        <div className="text-black dark:text-white w-full">
            <SectionHeader title="Submissions" subtitle="View form submissions." />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="mb-12 w-full">
                <div className="flex flex-col gap-4">
                    {submissions.length > 0 ? (
                        submissions.map((submission) => (
                            <CustomSubmissionCard
                                key={submission.id}
                                submission={submission}
                                form={form}
                            />
                        ))
                    ) : (
                        <p>No submissions found</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Submissions;

const CustomSubmissionCard = ({ submission, form }: { submission: Submission; form: Form }) => {
    const { content } = submission;
    const fields = form.fields || [];

    // Define the fieldIdToLabelMap with appropriate typing
    const fieldIdToLabelMap: Record<string, string> = {};
    fields.forEach((field) => {
        const fieldId = field.id.toString();
        let label = field.extraAttributes?.label;

        // Handle fields that may have 'title' or 'text' instead of 'label'
        if (!label) {
            label = field.extraAttributes?.title || field.extraAttributes?.text;
        }

        // Default to 'Field {fieldId}' if no label is found
        if (!label) {
            label = `Field ${fieldId}`;
        }

        fieldIdToLabelMap[fieldId] = label;
    });

    return (
        <div className="border rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-2">Submission ID: {submission.id}</h3>
            <p className="text-sm text-gray-600">
                Submitted At: {new Date(submission.created_at).toLocaleString()}
            </p>
            <div className="mt-4 space-y-2">
                {content &&
                    Object.entries(content).map(([fieldId, { label, value }]) => {
                        const displayLabel = fieldIdToLabelMap[fieldId] || `Field ${fieldId}`;
                        return (
                            <div key={fieldId} className="flex justify-between">
                                <span className="font-semibold text-gray-700">
                                    {displayLabel}:
                                </span>
                                <span className="text-gray-900">
                                    {value ?? 'N/A'}
                                </span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

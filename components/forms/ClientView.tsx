'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { LuAlertCircle } from 'react-icons/lu';
import { Submission, FormElementInstance, Form } from '@/types';
import SubmissionsTable from './SubmissionTable';
import { useState, useEffect } from 'react';
import { BsOctagonHalf } from "react-icons/bs";

interface ClientViewProps {
    form: Form;
    submissions: Submission[];
}

// Define a list of fillable field types
const fillableFieldTypes = [
    "TextField",
    "NumberField",
    "SelectField",
    "TelephoneField",
    "CheckboxField",
    "DateField",
    "TextAreaField",
];

export default function ClientView({ form, submissions }: ClientViewProps) {
    const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
    const [isMissingData, setIsMissingData] = useState<boolean>(false);

    useEffect(() => {
        if (submissions.length) {
            const parsedSubmissions = submissions.map(submission => ({
                ...submission,
                content: JSON.parse(submission.content)
            }));
            setUserSubmissions(parsedSubmissions);
        } else {
            setUserSubmissions([]); // Clear if no submissions are available
        }
    }, [submissions]);

    if (!form) return <Skeleton className="min-w-80 min-h-20" />;

    return (
        <div className="w-auto flex flex-col py-4">
            <h2 className="text-2xl font-semibold w-auto">Your Submissions</h2>
            <div className="my-10 w-auto flex flex-row">

                {isMissingData && (
                    <div className="alert alert-warning flex items-center m-auto">
                        <LuAlertCircle />
                        <span className="ml-2">You haven't submitted any form.</span>
                    </div>
                )}
                <div className="w-full p-4 ">
                    {userSubmissions.length > 0 ? (
                        userSubmissions.map((submission, index) => (
                            <div key={index} className="rounded flex flex-col gap-12">
                                {form?.fields
                                    .filter((field: FormElementInstance) =>
                                        fillableFieldTypes.includes(field.type)
                                    ) // Filter fillable fields
                                    .map((field: FormElementInstance) => (
                                        <div key={field.id} className="mb-2 flex gap-1">
                                            <label className="font-bold">
                                                {field.extraAttributes?.label || field.id}:
                                            </label>
                                            <div>{!submission.content[field.id] ? <div className="flex items-center gap-1">No data provided <LuAlertCircle /></div> : submission.content[field.id]}</div>
                                        </div>
                                    ))}
                            </div>
                        ))
                    ) : (
                        <p className="border p-16 border-dashed text-center rounded-md m-auto pb-20 ">
                            No submissions found
                        </p>
                    )}
                </div>
            </div>
            <div>
                {form ? (
                    <SubmissionsTable submissions={userSubmissions} form={form} />
                ) : (
                    <Skeleton className="min-h-20 w-full rounded-md" />
                )}
            </div>
        </div>
    );
}

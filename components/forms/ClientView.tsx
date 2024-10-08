'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { LuAlertCircle } from 'react-icons/lu';
import { Submission, FormElementInstance, Form } from '@/types';
import { useState, useEffect } from 'react';
import { FaRegFileAlt } from 'react-icons/fa';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons"; // If you prefer using this icon

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

    useEffect(() => {
        if (submissions.length) {
            console.log('submissions', submissions)
            const parsedSubmissions = submissions.map(submission => ({
                ...submission,
                content: JSON.parse(submission.content)
            }));
            setUserSubmissions(parsedSubmissions);
        }
    }, [submissions]);

    if (!form) return <Skeleton className="min-w-80 min-h-20" />;

    return (
        <div className="w-full flex flex-col py-8 px-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-semibold mb-6">Your Submissions</h2>
            <p className="text-italic mb-3">Esta sección será editable, y los usuarios podrán actualizar su información:</p>
            {userSubmissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userSubmissions.map((submission, index) => {
                        // Identify missing fields
                        const missingFields = form.fields
                            .filter((field: FormElementInstance) =>
                                fillableFieldTypes.includes(field.type) &&
                                (!submission.content[field.id] || submission.content[field.id] === '')
                            )
                            .map((field: FormElementInstance) => field.extraAttributes?.label || field.id);

                        return (
                            <div key={index} className="border rounded-lg p-6 bg-gray-50">
                                <div className="flex items-center mb-4">
                                    <FaRegFileAlt className="text-blue-500 mr-2" />
                                    <h3 className="text-xl font-bold">
                                        Submission #{index + 1}
                                    </h3>
                                </div>

                                {/* Submission Fields */}
                                <div className="space-y-4">
                                    {form.fields
                                        .filter((field: FormElementInstance) =>
                                            fillableFieldTypes.includes(field.type)
                                        )
                                        .map((field: FormElementInstance) => (
                                            <div key={field.id} className="flex flex-col">
                                                <label className="font-medium text-gray-700">
                                                    {field.extraAttributes?.label || field.id}
                                                </label>
                                                <div className="text-gray-900 mt-1">
                                                    {submission.content[field.id] !== undefined && submission.content[field.id] !== '' ? (
                                                        submission.content[field.id]
                                                    ) : (
                                                        <span className="text-sm text-gray-500 flex items-center">
                                                            <LuAlertCircle className="mr-1" /> No data provided
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Alert for Missing Fields */}
                                {
                                    missingFields.length > 0 && (
                                        <Alert variant="destructive" className="my-4 mt-8 flex gap-4">
                                            <LuAlertCircle className="h-6 w-6 text-red-500" />
                                            <div className="ml-2">
                                                <AlertTitle className="text-red-700 font-semibold">Atention! Missing Data</AlertTitle>
                                                <AlertDescription className="text-red-600">
                                                    The following fields are missing data:
                                                    <ul className="list-disc list-inside mt-2">
                                                        {missingFields.map((fieldLabel, idx) => (
                                                            <li key={idx}>{fieldLabel}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </div>
                                        </Alert>
                                    )
                                }
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64">
                    <LuAlertCircle className="text-gray-400 text-6xl mb-4" />
                    <p className="text-gray-500 text-xl">You haven't submitted any forms yet.</p>
                </div>
            )}
        </div>
    );
}

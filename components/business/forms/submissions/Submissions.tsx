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
import {
    FaTextHeight,
    FaHeading,
    FaParagraph,
    FaSlidersH,
    FaFileUpload,
    FaCalendarAlt,
    FaPhone,
    FaCheckSquare,
    FaUpload,
    FaClipboardList,
    FaMinusCircle,
    FaFileAlt,
    FaQuestionCircle,
} from 'react-icons/fa';
import { IconType } from 'react-icons';
import { BsDisc, BsDiscFill } from "react-icons/bs";
import { VscDebugBreakpointDataUnverified, VscDebugBreakpointLog, VscDebugBreakpointFunction } from "react-icons/vsc";
import { GoMultiSelect } from "react-icons/go";

export const iconMap = {
    TextField: VscDebugBreakpointDataUnverified,
    TitleField: VscDebugBreakpointLog,
    SubTitleField: VscDebugBreakpointFunction,
    ParagraphField: FaParagraph,
    SeparatorField: FaSlidersH,
    SpacerField: FaMinusCircle,
    NumberField: FaClipboardList,
    TextAreaField: FaFileAlt,
    DateField: FaCalendarAlt,
    SelectField: GoMultiSelect,
    TelephoneField: FaPhone,
    CheckboxField: FaCheckSquare,
    FileUploadField: FaFileUpload,
};

const CustomSubmissionCard = ({ submission, form }: { submission: Submission, form: Form }) => {
    const { content } = submission;
    const fields = form.fields || [];

    const informationalFields = ["TitleField", "SubTitleField", "ParagraphField"];
    const separatorFields = ["SeparatorField"];

    return (
        <div className="border border-gray-200 rounded-lg p-6 shadow-lg max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{form.name}</h3>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Submission ID: <span className="underline">{submission.id}</span></h2>
            <p className="text-sm text-gray-500 mb-4">
                Submitted At: {new Date(submission.created_at).toLocaleString()}
            </p>
            <div className="mt-4 space-y-4">
                {fields.map((field) => {
                    const fieldId = field.id.toString();
                    const label =
                        field.extraAttributes?.label ||
                        field.extraAttributes?.title ||
                        field.extraAttributes?.text ||
                        `Field ${fieldId}`;
                    const type = field.type;
                    const IconComponent = iconMap[type] || FaQuestionCircle;

                    if (separatorFields.includes(type)) {
                        return <hr key={fieldId} className="my-6 border-t border-gray-300" />;
                    }

                    const value = content ? content[fieldId] : "N/A";

                    if (type === "TitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <IconComponent className="mr-2 text-gray-600 text-2xl" />
                                <span className="text-xl font-semibold text-gray-800">{label}</span>
                            </div>
                        );
                    }

                    if (type === "SubTitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <IconComponent className="mr-2 text-gray-500 text-xl" />
                                <span className="text-lg font-medium text-gray-700">{label}</span>
                            </div>
                        );
                    }

                    if (type === "ParagraphField") {
                        return (
                            <div key={fieldId} className="flex items-start mb-2">
                                {/* <IconComponent className="mr-2 text-gray-500" /> */}
                                <p className="text-gray-600 text-base">{label}</p>
                            </div>
                        );
                    }

                    return (
                        <div key={fieldId} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <IconComponent className="mr-2 text-gray-500" />
                                <span className="font-semibold text-gray-800">{label}:</span>
                            </div>
                            <span className="text-gray-700 capitalize">{value || "N/A"}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
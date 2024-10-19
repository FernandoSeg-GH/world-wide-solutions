'use client';

import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, Form, ElementsType } from '@/types';
import { cn } from '@/lib/utils';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import Spinner from '@/components/ui/spinner';
import { useFormState } from '@/hooks/forms/useFormState';
import { formatDistance } from 'date-fns';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

function SubmissionsTable({ form, admin }: { form: Form, admin?: boolean }) {
    const { submissions, fetchSubmissions, loading } = useSubmissions();

    useEffect(() => {
        if (form) {
            console.log('form', form)
            fetchSubmissions(form.shareUrl, form.businessId);
        }
    }, [form]);

    if (loading || !form) {
        return <Spinner />;
    }

    // if (!Array.isArray(submissions) || submissions.length === 0) {
    //     return <p className="text-muted-foreground">No submissionssssss available.</p>;
    // }

    const isInputField = (fieldType: ElementsType): boolean => {
        const inputFieldTypes: ElementsType[] = [
            "TextField",
            "NumberField",
            "TextAreaField",
            "DateField",
            "SelectField",
            "TelephoneField",
            "CheckboxField"
        ];
        return inputFieldTypes.includes(fieldType);
    };

    const fields = Array.isArray(form.fields) ? form.fields : [];

    const rows = submissions.map((submission) => {
        const parsedContent: Record<string, any> = submission.content || {};

        const row: { [key: string]: any } = {
            submittedAt: submission.createdAt,
        };

        fields.forEach((field) => {
            if (isInputField(field.type) && parsedContent[field.id] !== undefined) {
                row[field.id] = parsedContent[field.id];
            }
        });
        return row;
    });

    const fieldMap = fields.reduce((acc: { [key: string]: string }, field) => {
        if (isInputField(field.type)) {
            acc[field.id] = field.extraAttributes?.label || `Field ${field.id}`;
        }
        return acc;
    }, {});

    const fieldKeys = Object.keys(fieldMap);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        };

        return date.toLocaleDateString('en-US', options);
    }
    const formattedDate = form.createdAt
        ? formatDistance(new Date(form.createdAt), new Date(), {
            addSuffix: true,
        })
        : "Unknown time";

    console.log('form', form)
    return (
        <div className="w-full flex flex-col items-start justify-start">

            <div>
                <h3>Created At: <span>{formattedDate}</span></h3>
                <p>{form.published}</p>
            </div>
            <div className="rounded-lg border shadow-sm w-full overflow-x-auto">
                <Table className={cn("w-full table-auto")}>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            {fieldKeys.map((fieldKey) => (
                                <TableHead key={fieldKey} className="uppercase text-sm font-semibold px-6 py-3">
                                    {fieldMap[fieldKey] || `Field ${fieldKey}`}
                                </TableHead>
                            ))}
                            <TableHead className="uppercase text-sm font-semibold px-6 py-3">Submitted At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {fieldKeys.map((key) => (
                                    <TableCell key={key} className="px-6 py-4 text-sm text-gray-700">
                                        {row[key] || <span className="text-gray-400">N/A</span>}
                                    </TableCell>
                                ))}
                                <TableCell className="px-6 py-4 text-sm text-gray-600 text-right">
                                    {formatDate(row.submittedAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default SubmissionsTable;

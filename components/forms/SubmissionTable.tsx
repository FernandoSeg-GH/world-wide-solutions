'use client';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, Form, ElementsType } from '@/types';
import { cn } from '@/lib/utils';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

function SubmissionsTable({ submissions, form, admin }: { submissions: Submission[]; form: Form, admin?: boolean }) {
    if (!Array.isArray(submissions) || submissions.length === 0) {
        return <p className="text-muted-foreground">No submissions available.</p>;
    }

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

    // Ensure fields exist and are an array
    const fields = Array.isArray(form.fields) ? form.fields : [];

    const rows = submissions.map((submission) => {
        const parsedContent: { [key: string]: any } = (() => {
            try {
                return JSON.parse(submission.content);
            } catch (error) {
                console.error('Error parsing submission content:', error);
                return {}; // Return empty object if parsing fails
            }
        })();

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

    return (
        <div className="w-full flex flex-col items-start justify-start my-10">
            <h1 className="text-3xl font-bold my-6">Submissions</h1>
            <h2 className="text-2xl font-semibold mb-6">Form: <span className='font-normal'>{form.name}</span></h2>
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

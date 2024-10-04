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
        return <></>;
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

    const rows = submissions.map((submission) => {
        let parsedContent: { [key: string]: any } = {};
        try {
            parsedContent = JSON.parse(submission.content);
        } catch (error) {
            console.error('Error parsing submission content:', error);
        }

        const row: { [key: string]: any } = {
            submittedAt: submission.createdAt,
        };

        form.fields.forEach((field) => {
            if (isInputField(field.type) && parsedContent[field.id] !== undefined) {
                row[field.id] = parsedContent[field.id];
            }
        });
        return row;
    });


    const fieldMap = form.fields.reduce((acc: { [key: string]: string }, field) => {
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        };

        return date.toLocaleDateString('en-US', options);
    }

    return (
        <div className='w-auto flex flex-col items-start justify-start'>
            <h1 className="text-2xl font-bold my-4">Submissions</h1>
            <h2 className="text-2xl font-semibold col-span-2 mb-2">Form: <span className='font-normal'>{form.name}</span></h2>
            <div className="rounded-md border w-full">
                <Table className={cn("w-full")}>
                    <TableHeader>
                        <TableRow>
                            {fieldKeys.map((fieldKey) => (
                                <TableHead key={fieldKey} className="uppercase">
                                    {fieldMap[fieldKey] || `Field ${fieldKey}`}
                                </TableHead>
                            ))}
                            <TableHead className="uppercase">Submitted At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => {
                            console.log('row', row)
                            return (
                                <TableRow key={index}>
                                    {fieldKeys.map((key) => (
                                        <TableCell key={key}>{row[key]}</TableCell>
                                    ))}
                                    <TableCell className="text-muted-foreground text-right">
                                        {formatDate(row.submittedAt)}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default SubmissionsTable;

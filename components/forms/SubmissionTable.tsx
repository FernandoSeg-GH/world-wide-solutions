'use client';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, Form } from '@/types';
import { cn } from '@/lib/utils';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

function SubmissionsTable({ submissions, form, admin }: { submissions: Submission[]; form: Form, admin?: boolean }) {
    if (!Array.isArray(submissions) || submissions.length === 0) {
        return <div>No submissions found</div>;
    }

    const rows = submissions.map((submission) => {
        let parsedContent: { [key: string]: any } = {};
        try {
            parsedContent = JSON.parse(submission.content);
        } catch (error) {
            console.error('Error parsing submission content:', error);
        }

        const row: { [key: string]: any } = {
            submittedAt: submission.createdAt,  // Ensure this field exists and is correctly formatted
        };

        form.fields.forEach((field) => {
            row[field.id] = parsedContent[field.id] ?? 'No data';  // Map content to form fields
        });

        return row;
    });


    const fieldMap = form.fields.reduce((acc: { [key: string]: string }, field) => {
        acc[field.id] = field.extraAttributes?.label || `Field ${field.id}`;
        return acc;
    }, {});

    const fieldKeys = form.fields.map((field) => field.id);

    return (
        <div className='w-full flex flex-col items-start justify-start'>
            {!admin ?
                <h1 className="text-2xl font-bold my-4">Submissions</h1> :
                <h1 className="text-2xl font-bold my-4">Form: <span className='font-normal'>{form.name}</span></h1>
            }
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
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {fieldKeys.map((key) => (
                                    <TableCell key={key}>{row[key] || 'No data'}</TableCell>
                                ))}
                                <TableCell className="text-muted-foreground text-right">
                                    {new Date(row.submittedAt).toLocaleString() || 'Invalid Date'}
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

'use client';

import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, Form, ElementsType } from '@/types';
import { cn } from '@/lib/utils';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import Spinner from '@/components/ui/spinner';
import { formatDistance } from 'date-fns';
import { useFieldMapping } from '@/hooks/forms/useFieldMapping';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

function SubmissionsTable({ form, admin }: { form: Form; admin?: boolean }) {
    const { submissions, fetchSubmissions, loading } = useSubmissions();
    const { fieldKeys, fieldMap } = useFieldMapping(form);

    useEffect(() => {
        if (form.shareUrl) {
            fetchSubmissions(form.shareUrl);
        }
    }, [form.shareUrl, fetchSubmissions]);

    if (loading || !form) {
        return <Spinner />;
    }


    const rows = submissions.map((submission) => {
        const parsedContent: Record<string, any> =
            typeof submission.content === 'string' ? JSON.parse(submission.content) : submission.content || {};

        const row: { [key: string]: any } = {
            submittedAt: submission.createdAt,
        };

        fieldKeys.forEach((key) => {
            const fieldValue = parsedContent[key];
            if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
                row[key] = fieldValue.value;
            } else {
                row[key] = fieldValue;
            }
        });

        return row;
    });

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
        : 'Unknown time';

    function renderCellValue(key: string, value: any) {
        const field = fieldMap[key];
        const fieldType = field?.type;

        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-400">N/A</span>;
        }

        if (fieldType === 'SelectField' && typeof value === 'string') {
            const options = field.extraAttributes?.options || [];
            const selectedOption = options.find((option: any) => option.value === value);
            return selectedOption ? selectedOption.label : value;
        }

        if (fieldType === 'CheckboxField' && typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (fieldType === 'DateField' && typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date.toLocaleDateString();
        }

        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return value;
    }

    return (
        <div className="w-full overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                    <Table className="min-w-full divide-y divide-gray-200">
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                {fieldKeys.map((fieldKey) => (
                                    <TableHead
                                        key={fieldKey}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {fieldMap[fieldKey]?.label || `Field ${fieldKey}`}
                                    </TableHead>
                                ))}
                                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Submitted At
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white divide-y divide-gray-200">
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    {fieldKeys.map((key) => (
                                        <TableCell
                                            key={key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                        >
                                            {renderCellValue(key, row[key])}
                                        </TableCell>
                                    ))}
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {formatDate(row.submittedAt)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default SubmissionsTable;

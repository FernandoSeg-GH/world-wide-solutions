'use client';

import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Submission, Form } from '@/types';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import Spinner from '@/components/ui/spinner';
import { useFieldMapping } from '@/hooks/forms/useFieldMapping';
import { useSession } from 'next-auth/react';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

// Helper function to generate the full file URL
const generateFileUrl = (businessId: string, userId: string, fileName: string) => {
    return `https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_${businessId}/user_id_${userId}/${fileName}`;
};

function SubmissionsTable({ form, admin }: { form: Form; admin?: boolean }) {
    const { submissions, fetchSubmissions, loading } = useSubmissions();
    const { fieldKeys, fieldMap } = useFieldMapping(form);
    const { data: session } = useSession();

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
            submittedAt: submission.created_at,
        };

        fieldKeys.forEach((key) => {
            const fieldValue = parsedContent[key];
            // Generate the file URL if it's a file upload field
            if (fieldMap[key]?.type === 'FileUploadField' && fieldValue) {
                row[key] = generateFileUrl(String(session?.user!.businessId!), String(session?.user.id), fieldValue);
            } else {
                row[key] = fieldValue || 'N/A';
            }
        });

        return row;
    });

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    }

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

        if (fieldType === 'FileUploadField' && typeof value === 'string') {
            return (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View File
                </a>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return value;
    }

    return (
        <div className="inline-block min-w-full align-middle border rounded-lg">
            <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        {fieldKeys.map((fieldKey) => (
                            <TableHead
                                key={fieldKey}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                                {fieldMap[fieldKey]?.extraAttributes?.label || `Field ${fieldKey}`}
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
                                    className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap max-w-[200px] overflow-hidden"
                                >
                                    {renderCellValue(key, row[key])}
                                </TableCell>
                            ))}
                            <TableCell className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(row.submittedAt)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default SubmissionsTable;

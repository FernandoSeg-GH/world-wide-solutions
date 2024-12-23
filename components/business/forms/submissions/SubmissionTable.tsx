'use client';

import React, { useEffect } from 'react';
import { Submission, Form } from '@/types';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import Spinner from '@/components/ui/spinner';
import { useFieldMapping } from '@/hooks/forms/useFieldMapping';
import { useSession } from 'next-auth/react';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';

interface Row {
    submittedAt: string;
    [key: string]: any;
}

const SubmissionsTable = ({ form, admin }: { form: Form; admin: boolean }) => {
    const { submissions, fetchSubmissions, loading } = useSubmissions();
    const { fieldKeys, fieldMap } = useFieldMapping(form);
    const { data: session } = useSession();

    useEffect(() => {
        if (form.shareUrl) {
            fetchSubmissions(form.shareUrl);
        }
    }, [form.shareUrl, fetchSubmissions]);

    if (loading || !form) {
        return <div className="flex items-center justify-center w-screen h-screen">
            <Spinner />
        </div>;;
    }

    const rows: Row[] = submissions.map((submission) => {
        const parsedContent =
            typeof submission.content === 'string'
                ? JSON.parse(submission.content)
                : submission.content || {};
        const row: Row = { submittedAt: submission.created_at };

        fieldKeys.forEach((key) => {
            const fieldValue = parsedContent[key];
            row[key] = fieldValue || 'N/A';
        });

        return row;
    });


    const totalColumns = fieldKeys.length + 1;
    const columnWidthPercentage = `${100 / totalColumns}%`;

    const handleDownloadCSV = () => {
        const csvData = convertRowsToCSV(rows);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${form.name || 'submissions'}.csv`);
    };

    const convertRowsToCSV = (rows: Row[]) => {
        const csvRows = [];
        const headers = fieldKeys.map((fieldKey) =>
            fieldMap[fieldKey]?.extraAttributes?.label || `Field ${fieldKey}`
        );
        headers.push('Submitted At');
        csvRows.push(headers.join(','));

        rows.forEach((row) => {
            const values = fieldKeys.map((key) => {
                let val = row[key];
                if (typeof val === 'string') {
                    val = val.replace(/"/g, '""');
                    if (val.includes(',') || val.includes('"')) {
                        val = `"${val}"`;
                    }
                }
                return val;
            });

            let submittedAt = new Date(row.submittedAt).toLocaleString();
            submittedAt = submittedAt.replace(/"/g, '""');
            if (submittedAt.includes(',') || submittedAt.includes('"')) {
                submittedAt = `"${submittedAt}"`;
            }
            values.push(submittedAt);
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    };

    const handleDownloadExcel = async () => {
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('Submissions');


        const headers = fieldKeys.map((fieldKey) =>
            fieldMap[fieldKey]?.extraAttributes?.label || `Field ${fieldKey}`
        );
        headers.push('Submitted At');
        worksheet.addRow(headers);


        rows.forEach((row) => {
            const rowData = fieldKeys.map((key) => row[key]);
            rowData.push(new Date(row.submittedAt).toLocaleString());
            worksheet.addRow(rowData);
        });


        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `${form.name || 'submissions'}.xlsx`);
    };


    return (
        <div className="overflow-x-auto w-full">
            {/* Add the download buttons */}
            <div className="mb-4 flex space-x-2">
                <Button
                    onClick={handleDownloadCSV}
                    variant="outline"
                >
                    Download CSV
                </Button>
                <Button
                    onClick={handleDownloadExcel}
                    variant="outline"
                >
                    Download Excel
                </Button>
            </div>

            {/* Desktop and tablet view */}
            <table className="hidden sm:table w-full lg:table-fixed sm:table-auto border border-gray-300">
                <thead className="bg-gray-50 border-b border-gray-300">
                    <tr>
                        {fieldKeys.map((fieldKey) => (
                            <th
                                key={fieldKey}
                                style={{ minWidth: '150px', width: columnWidthPercentage }}
                                className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {fieldMap[fieldKey]?.extraAttributes?.label || `Field ${fieldKey}`}
                            </th>
                        ))}
                        <th
                            style={{ minWidth: '150px', width: columnWidthPercentage }}
                            className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                            Submitted At
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="bg-gray-200 border-b border-gray-200">
                            {fieldKeys.map((key) => (
                                <td
                                    key={key}
                                    style={{ minWidth: '150px', width: columnWidthPercentage }}
                                    className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                                >
                                    {row[key]}
                                </td>
                            ))}
                            <td
                                style={{ minWidth: '150px', width: columnWidthPercentage }}
                                className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {new Date(row.submittedAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile view */}
            <div className="sm:hidden space-y-4">
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="border border-gray-300 p-4 rounded-md bg-red-100">
                        {fieldKeys.map((key, index) => (
                            <div key={index} className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                    {fieldMap[key]?.extraAttributes?.label || `Field ${key}`}
                                </span>
                                <span className="text-sm text-gray-700">{row[key]}</span>
                            </div>
                        ))}
                        <div className="flex justify-between py-2">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                                Submitted At
                            </span>
                            <span className="text-sm text-gray-600">
                                {new Date(row.submittedAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubmissionsTable;

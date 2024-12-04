// components/SpreadsheetView.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { FaDownload } from 'react-icons/fa';
import { flattenClaimData } from '@/lib/utils';
import { EditableClaim } from './config/types';

interface SpreadsheetViewProps {
    claims: EditableClaim[];
}

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ claims }) => {
    const headers = Object.keys(flattenClaimData(claims[0])); // Get headers from the first claim

    const handleDownload = (format: 'csv' | 'excel' | 'pdf') => {
        const worksheetData = claims.map(claim => flattenClaimData(claim));

        if (format === 'csv' || format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

            if (format === 'excel') {
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                saveAs(blob, 'claims.xlsx');
            } else if (format === 'csv') {
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, 'claims.csv');
            }
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            const tableColumn = headers;
            const tableRows = worksheetData.map(data => Object.values(data));

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows as RowInput[],
            });

            doc.save('claims.pdf');
        }
    };

    return (
        <div className="overflow-x-auto w-full">
            {/* Download Buttons */}
            <div className="flex justify-end mb-4">
                <Button onClick={() => handleDownload('csv')} className="mr-2">
                    <FaDownload className="mr-2" /> Download CSV
                </Button>
                {/* <Button onClick={() => handleDownload('excel')} className="mr-2">
                    <FaDownload className="mr-2" /> Download Excel
                </Button> */}
                <Button onClick={() => handleDownload('pdf')}>
                    <FaDownload className="mr-2" /> Download PDF
                </Button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-black">
                    {/* Table Head */}
                    <thead>
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="border px-4 py-2 bg-gray-200 dark:bg-gray-700 whitespace-nowrap">
                                    {header.replace(/_/g, ' ').toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody>
                        {claims.map((claim) => {
                            const flatClaim = flattenClaimData(claim);
                            return (
                                <tr key={claim.claim_id}>
                                    {headers.map((header) => (
                                        <td key={header} className="border px-4 py-2  whitespace-nowrap">
                                            {String(flatClaim[header] || '')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpreadsheetView;

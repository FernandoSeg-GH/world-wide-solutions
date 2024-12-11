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
    selectedUserId: string | null;
}

const expandVehicleDetails = (claims: EditableClaim[]) => {
    const expandedClaims = claims.map(claim => {
        const flatClaim = flattenClaimData(claim);
        try {
            const vehicles = JSON.parse(flatClaim['vehicle_details'] || '[]');
            vehicles.forEach((vehicle: Record<string, string>, index: number) => {
                Object.entries(vehicle).forEach(([key, value]) => {
                    flatClaim[`vehicle_${index + 1}_${key}`] = value;
                });
            });
        } catch (error) {
            console.error('Error parsing vehicle_details:', error);
        }
        delete flatClaim['vehicle_details'];
        return flatClaim;
    });

    const allHeaders = new Set<string>();
    expandedClaims.forEach(claim => {
        Object.keys(claim).forEach(header => {
            if (!header.includes('file_uploads')) allHeaders.add(header);
        });
    });

    return { expandedClaims, headers: Array.from(allHeaders) };
};

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ claims, selectedUserId }) => {
    const filteredClaims = selectedUserId && selectedUserId !== "all"
        ? claims.filter(claim => claim.user.user_id === selectedUserId)
        : claims;

    const { expandedClaims, headers } = expandVehicleDetails(filteredClaims);

    const handleDownload = (format: 'csv' | 'excel' | 'pdf') => {
        if (format === 'csv' || format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(expandedClaims);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

            if (format === 'excel') {
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                saveAs(blob, 'claims.xlsx');
            } else {
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, 'claims.csv');
            }
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            const tableRows = expandedClaims.map(data =>
                headers.map(header => data[header] || '')
            );

            autoTable(doc, {
                head: [headers],
                body: tableRows as RowInput[],
            });

            doc.save('claims.pdf');
        }
    };

    return (
        <div className="overflow-x-auto w-full">
            <div className="flex justify-end mb-4">
                <Button onClick={() => handleDownload('csv')} className="mr-2">
                    <FaDownload className="mr-2" /> Download CSV
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-black">
                    <thead>
                        <tr>
                            {headers.map((header) => (
                                <th key={header} className="border px-4 py-2 bg-gray-200 dark:bg-gray-700 whitespace-nowrap">
                                    {header.replace(/_/g, ' ').toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {expandedClaims.map((claim, index) => (
                            <tr key={index}>
                                {headers.map((header) => (
                                    <td key={header} className="border px-4 py-2 whitespace-nowrap">
                                        {header.includes('date') && claim[header]
                                            ? new Date(claim[header]).toLocaleDateString()
                                            : claim[header] || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SpreadsheetView;

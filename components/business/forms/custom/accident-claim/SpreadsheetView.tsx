"use client";

import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { EditableClaim } from "./config/types";

const formatDate = (dateString: string | null | undefined): string =>
    dateString ? new Date(dateString).toLocaleDateString("en-GB") : "N/A";

interface SpreadsheetViewProps {
    claims: EditableClaim[];
    selectedUserId: string | null;
}

const flattenClaim = (claim: EditableClaim) => {
    const flatClaim: Record<string, any> = { ...claim };

    // Flatten user details
    if (flatClaim.user) {
        const { user_email, user_id, username } = flatClaim.user;
        flatClaim["USER EMAIL"] = user_email;
        flatClaim["USER ID"] = user_id;
        flatClaim["USERNAME"] = username;
        delete flatClaim.user;
    }

    // Format dates
    ["accident_date", "created_at", "updated_at"].forEach((dateField) => {
        if (flatClaim[dateField]) {
            flatClaim[dateField] = formatDate(flatClaim[dateField]);
        }
    });

    // Flatten nested fields: vehicle_details
    if (flatClaim.vehicle_details) {
        try {
            const parsed = typeof flatClaim.vehicle_details === "string"
                ? JSON.parse(flatClaim.vehicle_details)
                : flatClaim.vehicle_details;

            if (Array.isArray(parsed)) {
                parsed.forEach((item: Record<string, any>, idx: number) => {
                    Object.entries(item).forEach(([subKey, value]) => {
                        flatClaim[`VEHICLE DETAILS ${idx + 1} ${subKey.toUpperCase()}`] =
                            typeof value === "object" ? JSON.stringify(value) : value;
                    });
                });
            }
        } catch (error) {
            console.error("Error parsing vehicle_details:", error);
        }
        delete flatClaim.vehicle_details;
    }

    // Flatten nested fields: medical_provider_costs
    if (flatClaim.medical_provider_costs) {
        try {
            const parsed = typeof flatClaim.medical_provider_costs === "string"
                ? JSON.parse(flatClaim.medical_provider_costs)
                : flatClaim.medical_provider_costs;

            if (Array.isArray(parsed)) {
                parsed.forEach((item: Record<string, any>, idx: number) => {
                    Object.entries(item).forEach(([subKey, value]) => {
                        flatClaim[`MEDICAL PROVIDER COSTS ${idx + 1} ${subKey.toUpperCase()}`] =
                            typeof value === "object" ? JSON.stringify(value) : value;
                    });
                });
            }
        } catch (error) {
            console.error("Error parsing medical_provider_costs:", error);
        }
        delete flatClaim.medical_provider_costs;
    }

    // Remove unnecessary fields
    ["file_uploads", "editedData", "archive"].forEach((key) => delete flatClaim[key]);

    return flatClaim;
};

const expandClaims = (claims: EditableClaim[]) => {
    const expandedClaims = claims.map(flattenClaim);

    // Create headers from expanded claims
    const headers = Array.from(
        new Set(expandedClaims.flatMap((claim) => Object.keys(claim)))
    );

    // Filter out unnecessary columns
    const filteredHeaders = headers.filter(
        (header) => !["file_uploads", "editedData", "archive"].includes(header)
    );

    return { expandedClaims, headers: filteredHeaders };
};

const SpreadsheetView: React.FC<SpreadsheetViewProps> = ({ claims, selectedUserId }) => {
    const filteredClaims = selectedUserId && selectedUserId !== "all"
        ? claims.filter((claim) => claim.user.user_id === selectedUserId)
        : claims;

    const { expandedClaims, headers } = expandClaims(filteredClaims);

    const handleDownload = (format: "csv" | "excel" | "pdf") => {
        const worksheet = XLSX.utils.json_to_sheet(expandedClaims);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

        if (format === "excel") {
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "claims.xlsx");
        } else if (format === "csv") {
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
            saveAs(blob, "claims.csv");
        } else if (format === "pdf") {
            const doc = new jsPDF();
            const tableRows = expandedClaims.map((data) =>
                headers.map((header) => data[header] || "")
            );

            autoTable(doc, {
                head: [headers],
                body: tableRows as RowInput[],
            });

            doc.save("claims.pdf");
        }
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 p-6 rounded shadow-md">
            <div className="flex justify-end mb-4">
                <Button onClick={() => handleDownload("csv")} className="mr-2">
                    Download CSV
                </Button>
                <Button onClick={() => handleDownload("excel")} className="mr-2">
                    Download Excel
                </Button>
            </div>
            <Table className="w-full text-sm rounded-lg">
                <TableHeader>
                    <TableRow>
                        {headers.map((header) => (
                            <TableHead
                                key={header}
                                className="px-4 py-2 text-left bg-gray-200 dark:bg-gray-700 whitespace-nowrap"
                            >
                                {header.replace(/_/g, " ").toUpperCase()}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expandedClaims.map((claim, index) => (
                        <TableRow
                            key={index}
                            className="bg-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {headers.map((header) => (
                                <TableCell
                                    key={header}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap"
                                >
                                    {typeof claim[header] === "object"
                                        ? JSON.stringify(claim[header])
                                        : claim[header] || "N/A"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SpreadsheetView;

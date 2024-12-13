"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { FaDownload } from "react-icons/fa";
import { EditableClaim } from "./config/types";

const formatDate = (dateString: string | null | undefined): string =>
    dateString ? new Date(dateString).toLocaleDateString("en-GB") : "N/A";

interface SpreadsheetViewProps {
    claims: EditableClaim[];
    selectedUserId: string | null;
}

const flattenClaim = (claim: EditableClaim) => {
    const flatClaim: Record<string, any> = { ...claim };

    // Format date fields
    ["accident_date", "created_at", "updated_at"].forEach((dateField) => {
        if (flatClaim[dateField]) {
            flatClaim[dateField] = formatDate(flatClaim[dateField]);
        }
    });

    // Safely parse JSON-like fields
    ["vehicle_details", "medical_provider_costs", "repatriation_costs", "other_costs"].forEach((key) => {
        try {
            const parsed = typeof flatClaim[key] === "string" ? JSON.parse(flatClaim[key]) : flatClaim[key];
            if (Array.isArray(parsed)) {
                parsed.forEach((item: Record<string, any>, idx: number) => {
                    Object.entries(item).forEach(([subKey, value]) => {
                        flatClaim[`${key}_${idx + 1}_${subKey}`] = typeof value === "object"
                            ? JSON.stringify(value)
                            : value;
                    });
                });
            }
        } catch (error) {
            console.error(`Error parsing ${key}:`, error);
        }
    });

    // Remove unwanted keys
    ["file_uploads", "vehicle_details", "medical_provider_costs", "repatriation_costs", "other_costs"].forEach((key) => {
        delete flatClaim[key];
    });

    return flatClaim;
};


const expandClaims = (claims: EditableClaim[]) => {
    const expandedClaims = claims.map(flattenClaim);

    // Generate headers while filtering out unwanted columns
    const headers = Array.from(
        new Set(
            expandedClaims.flatMap((claim) =>
                Object.keys(claim).filter((header) => header !== "file_uploads")
            )
        )
    );

    return { expandedClaims, headers };
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
        <div className="overflow-x-auto w-full">
            <div className="flex justify-end mb-4">
                <Button onClick={() => handleDownload("csv")} className="mr-2">
                    <FaDownload className="mr-2" /> Download CSV
                </Button>
                <Button onClick={() => handleDownload("excel")} className="mr-2">
                    <FaDownload className="mr-2" /> Download Excel
                </Button>
                <Button onClick={() => handleDownload("pdf")}>
                    <FaDownload className="mr-2" /> Download PDF
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-black">
                    <thead>
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="border px-4 py-2 bg-gray-200 dark:bg-gray-700 whitespace-nowrap"
                                >
                                    {header.replace(/_/g, " ").toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {expandedClaims.map((claim, index) => (
                            <tr key={index}>
                                {headers.map((header) => (
                                    <td key={header} className="border px-4 py-2 whitespace-nowrap">
                                        {typeof claim[header] === "object" ? JSON.stringify(claim[header]) : claim[header] || ""}
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

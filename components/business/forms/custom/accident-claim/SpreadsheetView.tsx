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

    ["accident_date", "created_at", "updated_at"].forEach((dateField) => {
        if (flatClaim[dateField]) {
            flatClaim[dateField] = formatDate(flatClaim[dateField]);
        }
    });
    // Expand vehicle_details array
    try {
        const vehicles = typeof claim.vehicle_details === 'string' ? JSON.parse(claim.vehicle_details) : [];
        vehicles.forEach((vehicle: Record<string, any>, index: number) => {
            Object.entries(vehicle).forEach(([key, value]: [string, any]) => {
                flatClaim[`vehicle_${index + 1}_${key}`] = value;
            });
        });
    } catch (error) {
        console.error("Error parsing vehicle_details:", error);
    }

    // Expand costs arrays
    ["medical_provider_costs", "repatriation_costs", "other_costs"].forEach((costType) => {
        try {
            const costs = JSON.parse((claim as Record<string, any>)[costType] || "[]");
            costs.forEach((cost: Record<string, any>, index: number) => {
                Object.entries(cost).forEach(([key, value]: [string, any]) => {
                    flatClaim[`${costType}_${index + 1}_${key}`] = value;
                });
            });
        } catch (error) {
            console.error(`Error parsing ${costType}:`, error);
        }
    });

    // Remove unwanted columns explicitly
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
                                        {header.includes("date") && claim[header]
                                            ? new Date(claim[header]).toLocaleDateString()
                                            : claim[header] || ""}
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

// components/ClaimAccordion.tsx

import React from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { FaDownload, FaEdit } from "react-icons/fa";
import ClaimDetails from "./ClaimDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { cn, flattenClaimData } from "@/lib/utils";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { RowInput } from 'jspdf-autotable';
import html2canvas from "html2canvas";
import { EditableClaim } from "./config/types";

interface ClaimAccordionProps {
    claim: EditableClaim;
    toggleEdit: (claim_id: string) => void;
    handleFieldChange: (claim_id: string, fieldPath: string, value: any) => void;
    handleSave: (claim_id: string) => void;
    handleCancel: (claim_id: string) => void;
}

const ClaimAccordion: React.FC<ClaimAccordionProps> = ({
    claim,
    toggleEdit,
    handleFieldChange,
    handleSave,
    handleCancel,
}) => {

    const handleDownloadClaim = async (format: 'csv' | 'excel' | 'pdf') => {
        const flatClaim = flattenClaimData(claim);

        if (format === 'csv' || format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet([flatClaim]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Claim");

            if (format === 'excel') {
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                saveAs(blob, `claim_${claim.claim_id}.xlsx`);
            } else if (format === 'csv') {
                const csvData = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                saveAs(blob, `claim_${claim.claim_id}.csv`);
            }
        } else if (format === 'pdf') {
            const element = document.querySelector(`[data-claim-id="${claim.claim_id}"]`);

            if (element) {
                try {

                    const canvas = await html2canvas(element as HTMLElement, {
                        scale: 2,
                        useCORS: true,
                    });

                    const imgData = canvas.toDataURL("image/png");
                    const pdf = new jsPDF("p", "mm", "a4");
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();


                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio = canvasHeight / canvasWidth;
                    const imgHeight = pageWidth * ratio;

                    let heightLeft = imgHeight;
                    let position = 10;

                    while (heightLeft > 0) {
                        pdf.addImage(
                            imgData,
                            "PNG",
                            10,
                            position,
                            pageWidth - 20,
                            pageWidth * ratio
                        );
                        heightLeft -= pageHeight - 20;
                        position = -pageHeight + 30;

                        if (heightLeft > 0) {
                            pdf.addPage();
                        }
                    }

                    pdf.save(`claim_${claim.claim_id}.pdf`);
                } catch (err) {
                    console.error("Error generating PDF:", err);
                }
            }
        }
    };


    return (
        <Disclosure>
            {({ open }) => (
                <div className="border border-gray-300 rounded-lg">
                    {/* Disclosure Button */}
                    <DisclosureButton
                        className={cn(
                            "flex justify-between w-full text-sm font-medium text-left text-white bg-navyBlue rounded-t-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                            !open && "hover:bg-navyBlue-dark rounded-b-lg"
                        )}
                    >
                        <div className="w-full ">
                            <div className="flex flex-col px-4 py-3 items-start w-full justify-between">
                                <span className="font-semibold">
                                    {claim.full_name} - {new Date(claim.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-sm text-gray-200">
                                    Submitted by: {claim.username} ({claim.user_email})
                                </span>
                            </div>
                            <div className="w-full bg-white px-4 py-3 ">
                                <CardTitle className="text-lg font-bold text-navyBlue dark:text-white">
                                    Accident Claim Report
                                </CardTitle>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Patient: <strong>{claim.full_name}</strong>
                                </p>
                                <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                                    Submission ID: <span className="font-medium">{claim.claim_id}</span>
                                </CardDescription>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Submitted At: {new Date(claim.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </DisclosureButton>

                    {/* Disclosure Panel */}
                    <DisclosurePanel className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700" data-claim-id={claim.claim_id}>
                        <Card className="p-0">
                            <CardContent className="pt-6">
                                <ClaimDetails
                                    claim={claim}
                                    onEdit={toggleEdit}
                                    handleSave={handleSave}
                                    handleCancel={handleCancel}
                                    handleFieldChange={handleFieldChange}
                                />
                                <div className="flex justify-end mt-4 space-x-2">
                                    <Button
                                        onClick={() => handleDownloadClaim('csv')}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <FaDownload />
                                        Download CSV
                                    </Button>
                                    <Button
                                        onClick={() => handleDownloadClaim('excel')}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <FaDownload />
                                        Download Excel
                                    </Button>
                                    <Button
                                        onClick={() => handleDownloadClaim('pdf')}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <FaDownload />
                                        Download PDF
                                    </Button>
                                    <Button
                                        onClick={() => toggleEdit(claim.claim_id)}
                                        className="flex items-center gap-2"
                                    >
                                        <FaEdit />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </DisclosurePanel>
                </div>
            )}
        </Disclosure>
    );
};

export default ClaimAccordion;

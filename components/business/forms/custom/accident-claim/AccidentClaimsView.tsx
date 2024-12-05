"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { AccidentClaimFormData, Claim, EditableClaim, GroupedClaims } from "./config/types";
import { mapClaimToFormData, formSections } from "./config/form-config";
import ClaimAccordion from "./ClaimAccordion";
import { toast } from "@/components/ui/use-toast";
import SpreadsheetView from "./SpreadsheetView";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable, { RowInput } from 'jspdf-autotable';
import { flattenClaimData } from "@/lib/utils";
import _ from "lodash";

const AccidentClaimsView: React.FC = () => {
    const { data: session } = useSession();
    const [claims, setClaims] = useState<EditableClaim[]>([]);
    const [groupedClaims, setGroupedClaims] = useState<GroupedClaims[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const businessId = String(session?.user?.businessId);
    const [isSpreadsheetView, setIsSpreadsheetView] = useState<boolean>(false);

    // AccidentClaimsView.tsx

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const response = await fetch("/api/forms/accident-claims");

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch claims.");
                }

                const data = await response.json();

                const initializedClaims: EditableClaim[] = Array.isArray(data.claims)
                    ? data.claims.map((claim: Claim) => ({
                        ...claim,
                        accident_date: claim.accident_date ? new Date(claim.accident_date).toISOString() : "",
                        isEditing: false,
                        editedData: mapClaimToFormData(claim, businessId),
                        user: {
                            user_id: String(claim.user_id),
                            username: claim.username,
                            user_email: claim.user_email,
                        },
                    }))
                    : [];

                setClaims(initializedClaims);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An error occurred.");
                setLoading(false);
            }
        };

        if (session?.accessToken && session?.user?.role.id) {
            fetchClaims();
        }
    }, [businessId, session]);



    useEffect(() => {
        // Group claims by user for roles 2,3,4
        if ([2, 3, 4].includes(Number(session?.user?.role.id))) {
            const groups: { [key: string]: GroupedClaims } = {};

            claims.forEach((claim) => {
                const userKey = claim.user.user_id;
                if (!groups[userKey]) {
                    groups[userKey] = {
                        user: claim.user,
                        claims: [],
                    };
                }
                groups[userKey].claims.push(claim);
            });

            // Convert the groups object to an array
            const groupedArray: GroupedClaims[] = Object.values(groups);

            // Optional: Sort the groups alphabetically by username
            groupedArray.sort((a, b) => a.user.username.localeCompare(b.user.username));

            setGroupedClaims(groupedArray);
        }
    }, [claims, session?.user?.role.id]);

    const toggleEdit = (claim_id: string) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) => {
                if (claim.claim_id === claim_id) {
                    const isNowEditing = !claim.isEditing;
                    const newEditedData = isNowEditing ? mapClaimToFormData(claim, businessId) : { ...claim.editedData };
                    console.log(`Toggling edit for claim ${claim_id}. Now editing: ${isNowEditing}`, newEditedData);
                    return {
                        ...claim,
                        isEditing: isNowEditing,
                        editedData: newEditedData,
                    };
                }
                return claim;
            })
        );
    };

    const setNestedValue = (obj: any, path: string[], value: any) => {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            const part = path[i];
            // Handle array indices
            if (part.includes("[")) {
                const [arrayKey, indexStr] = part.split("[");
                const index = parseInt(indexStr.replace("]", ""), 10);
                if (!current[arrayKey]) current[arrayKey] = [];
                if (!current[arrayKey][index]) current[arrayKey][index] = {};
                current = current[arrayKey][index];
            } else {
                if (!current[part]) current[part] = {};
                current = current[part];
            }
        }
        const lastPart = path[path.length - 1];
        if (lastPart.includes("[")) {
            const [arrayKey, indexStr] = lastPart.split("[");
            const index = parseInt(indexStr.replace("]", ""), 10);
            if (!current[arrayKey]) current[arrayKey] = [];
            current[arrayKey][index] = value;
        } else {
            current[lastPart] = value;
        }
    };

    const handleFieldChange = (claim_id: string, fieldPath: string, value: any) => {
        const pathArray = fieldPath.replace(/\[(\d+)\]/g, '.$1').split('.');
        setClaims((prevClaims) =>
            prevClaims.map((claim) => {
                if (claim.claim_id !== claim_id) return claim;
                const newEditedData = { ...claim.editedData };
                setNestedValue(newEditedData, pathArray, value);
                return {
                    ...claim,
                    editedData: newEditedData,
                };
            })
        );
    };


    const validateForm = (editedData: AccidentClaimFormData): string[] => {
        const errors: string[] = [];

        formSections.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.required) {
                    const value = editedData[field.id as keyof AccidentClaimFormData];
                    if (
                        value === null ||
                        value === undefined ||
                        value === "" ||
                        (Array.isArray(value) && value.length === 0)
                    ) {
                        errors.push(`${field.label} is required.`);
                    }
                }
            });
        });

        return errors;
    };

    const handleSave = async (claim_id: string) => {
        const claimToUpdate = claims.find((claim) => claim.claim_id === claim_id);
        if (!claimToUpdate || !claimToUpdate.editedData) return;

        const validationErrors = validateForm(claimToUpdate.editedData);
        if (validationErrors.length > 0) {
            validationErrors.forEach((error) => toast({
                title: "Validation Error",
                description: error,
            }));
            return;
        }

        const submitData = new FormData();

        Object.entries(claimToUpdate.editedData).forEach(([key, value]) => {
            if (key === 'new_file_uploads') return;

            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                // For JSON fields
                submitData.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                // For array fields like vehicle_details
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "string" || typeof value === "number") {
                submitData.append(key, value.toString());
            }
        });

        // Handle new file uploads
        if (
            claimToUpdate.editedData.new_file_uploads &&
            claimToUpdate.editedData.new_file_uploads.length > 0
        ) {
            claimToUpdate.editedData.new_file_uploads.forEach((file) => {
                submitData.append("new_file_uploads", file);
            });
        }

        try {
            const response = await fetch(
                `/api/forms/submissions/claim/${claim_id}/update`,
                {
                    method: "PUT",
                    body: submitData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update claim.");
            }

            const responseData = await response.json();

            if (responseData.claim) {
                const updatedClaim: Claim = responseData.claim;

                setClaims((prevClaims) =>
                    prevClaims.map((claim) =>
                        claim.claim_id === claim_id
                            ? {
                                ...updatedClaim,
                                isEditing: false,
                                editedData: mapClaimToFormData(updatedClaim, businessId),
                                user: {
                                    user_id: String(updatedClaim.user_id),          // Ensure these fields are present
                                    username: updatedClaim.username,
                                    user_email: updatedClaim.user_email,
                                },
                            }
                            : claim
                    )
                );
            } else {
                setClaims((prevClaims) =>
                    prevClaims.map((claim) =>
                        claim.claim_id === claim_id
                            ? {
                                ...claim,
                                isEditing: false,
                                editedData: {
                                    ...claim.editedData,
                                },
                            }
                            : claim
                    )
                );
            }

            toast({
                title: "Success",
                description: "Form submitted successfully!",
            });


        } catch (err: any) {
            console.error("Submission Error:", err);
            toast({
                title: "Submission Error",
                description: `Failed to submit form: ${err.message || "Unknown error"}`,
                variant: "destructive",
            });
        }
    };

    const handleCancel = (claim_id: string) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id
                    ? {
                        ...claim,
                        isEditing: false,
                        editedData: mapClaimToFormData(claim, businessId),
                    }
                    : claim
            )
        );
    };

    const handleDownloadAllClaims = (format: 'csv' | 'excel' | 'pdf') => {

        if (format === 'csv' || format === 'excel') {

            const worksheetData = claims.map(claim => {
                const flatClaim = flattenClaimData(claim);
                return flatClaim;
            });

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
            if (claims.length > 0) {
                const tableColumn = Object.keys(flattenClaimData(claims[0]));
                const tableRows = claims.map(claim => Object.values(flattenClaimData(claim)));

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows as RowInput[],
                });
            } else {
                doc.text("No claims available to generate PDF.", 10, 10);
            }

            doc.save('claims.pdf');
        }
    };

    const handleStatusChange = async (claim_id: string, newStatus: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/accident-claim/${claim_id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update status.");
            }

            const data = await response.json();

            setClaims((prevClaims) =>
                prevClaims.map((claim) =>
                    claim.claim_id === claim_id ? { ...claim, status: newStatus } : claim
                )
            );

            toast({
                title: "Success",
                description: "Claim status updated successfully!",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update status.",
                variant: "destructive",
            });
        }
    };
    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center text-white">Loading...</div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center text-red-500">Error: {error}</div>
            </div>
        );

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 overflow-y-scroll no-scrollbar">
            <div className="">
                {/* Title Section */}
                <div className="mb-8 flex flex-row items-start justify-between w-full gap-16 text-start">
                    <div className="lg:text-left">
                        <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                            <FaEdit />
                            {session?.user?.role.id === 1 ? "My Claim Reports" : "All Accident Claims"}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">
                            Review and manage your submitted accident claims below.
                            <br />
                            Click on a claim to view or edit its details.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center">
                            <span className="mr-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                {isSpreadsheetView ? "Spreadsheet View" : "Card View"}
                            </span>
                            <Switch
                                checked={isSpreadsheetView}
                                onCheckedChange={setIsSpreadsheetView}
                            />
                        </div>
                        {/* Download Buttons */}
                        {isSpreadsheetView && (
                            <div className="flex items-center gap-2">
                                <Button onClick={() => handleDownloadAllClaims('csv')} variant="outline">
                                    <FaEdit className="mr-2" /> Download CSV
                                </Button>
                                {/* <Button onClick={() => handleDownloadAllClaims('pdf')} variant="outline">
                                    <FaEdit className="mr-2" /> Download PDF
                                </Button> */}
                            </div>
                        )}

                    </div>

                </div>

                {/* Claims List */}
                {claims.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No claims found.</p>
                ) : isSpreadsheetView ? (
                    <SpreadsheetView claims={claims} />
                ) : (
                    <div className="space-y-6">
                        {session?.user?.role.id === 1 ? (
                            // Role 1: User - Show their own claims in accordions
                            claims.map((claim) => (
                                <ClaimAccordion
                                    handleStatusChange={handleStatusChange}
                                    key={claim.claim_id}
                                    claim={claim}
                                    toggleEdit={toggleEdit}
                                    handleFieldChange={handleFieldChange}
                                    handleSave={handleSave}
                                    handleCancel={handleCancel}
                                />
                            ))
                        ) : (
                            // Roles 2,3,4: Business/Admin - Group claims by user
                            groupedClaims.map((group, index) => (
                                <div key={group.user.user_id} className="border-t border-gray-300 dark:border-gray-600 pt-6">
                                    {/* User Subheader */}
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                                            Submitted by: <span className="capitalize">{group.user.username}</span>
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {group.user.user_email}
                                        </p>
                                    </div>
                                    {/* Claims for the User */}
                                    <div className="space-y-6">
                                        {group.claims.map((claim) => {
                                            return (
                                                <ClaimAccordion
                                                    handleStatusChange={handleStatusChange}
                                                    key={claim.claim_id}
                                                    claim={claim}
                                                    toggleEdit={toggleEdit}
                                                    handleFieldChange={handleFieldChange}
                                                    handleSave={handleSave}
                                                    handleCancel={handleCancel}
                                                />
                                            )
                                        })}
                                    </div>
                                    {/* Optional: Add a horizontal separator between user groups, except after the last group */}
                                    {/* {index < groupedClaims.length - 1 && (
                                        <hr className="mt-6 border-gray-300 dark:border-gray-600" />
                                    )} */}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );

};

export default AccidentClaimsView;

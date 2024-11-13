// components/AccidentClaimsView.tsx

"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from 'next/navigation';

import { AccidentClaimFormData, Claim } from "./config/types";
import { mapClaimToFormData, formSections } from "./config/form-config";
import ClaimAccordion from "./ClaimAccordion";
import { toast } from "@/components/ui/use-toast";
import { getNestedValue } from "./ClaimDetails";
import { sub } from "date-fns";

function safeJsonParse(value: string | any, fieldName: string) {
    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
        console.error(`Error parsing ${fieldName}:`, e);
        return null;
    }
}

export interface EditableClaim extends Claim {
    isEditing: boolean;
    editedData: AccidentClaimFormData;
}

const AccidentClaimsView: React.FC = () => {
    const { data: session } = useSession();
    const [claims, setClaims] = useState<EditableClaim[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const businessId = String(session?.user?.businessId)

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/user_accident_claims`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch claims.");
                }

                const data = await response.json();

                const initializedClaims: EditableClaim[] = Array.isArray(data.claims)
                    ? data.claims.map((claim: Claim) => ({
                        ...claim,
                        mva_attorney_info: safeJsonParse(claim.mva_attorney_info, 'mva_attorney_info'),
                        mva_costs: safeJsonParse(claim.mva_costs, 'mva_costs'),
                        mva_medical_info: safeJsonParse(claim.mva_medical_info, 'mva_medical_info'),
                        mva_third_party_info: safeJsonParse(claim.mva_third_party_info, 'mva_third_party_info'),
                        vehicle_details: safeJsonParse(claim.vehicle_details, 'vehicle_details'),
                        witness_info: safeJsonParse(claim.witness_info, 'witness_info'),
                        accident_date: claim.accident_date ? new Date(claim.accident_date).toISOString() : null,
                        slip_attorney_info: safeJsonParse(claim.slip_attorney_info, 'slip_attorney_info'),
                        slip_costs: safeJsonParse(claim.slip_costs, 'slip_costs'),
                        slip_medical_info: safeJsonParse(claim.slip_medical_info, 'slip_medical_info'),
                        slip_third_party_info: safeJsonParse(claim.slip_third_party_info, 'slip_third_party_info'),
                        // Initialize editing state
                        isEditing: false,
                        editedData: mapClaimToFormData(claim, businessId),
                    }))
                    : [];

                setClaims(initializedClaims);
                console.log('Initialized Claims:', initializedClaims); // Verify business_id here
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An error occurred.");
                setLoading(false);
            }
        };

        if (session?.accessToken) {
            fetchClaims();
        }
    }, [businessId, session]);

    const toggleEdit = (claim_id: string) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id
                    ? {
                        ...claim,
                        isEditing: !claim.isEditing,
                        editedData: !claim.isEditing ? mapClaimToFormData(claim, businessId) : { ...claim.editedData },
                    }
                    : claim
            )
        );
    };

    const handleFieldChange = (claim_id: string, fieldPath: string, value: any) => {
        const pathParts = fieldPath.split(".");

        setClaims((prevClaims) =>
            prevClaims.map((claim) => {
                if (claim.claim_id !== claim_id) return claim;

                // Handle new_file_uploads separately
                if (fieldPath === "new_file_uploads") {
                    return {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            new_file_uploads: value, // value is File[]
                        },
                    };
                }

                // Handle nested fields
                if (pathParts.length === 2) {
                    const [section, fieldId] = pathParts as [keyof AccidentClaimFormData, string];

                    return {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            [section]: {
                                ...(claim.editedData[section] as any || {}),
                                [fieldId]: value,
                            },
                        },
                    };
                }

                // Handle top-level fields
                return {
                    ...claim,
                    editedData: {
                        ...claim.editedData,
                        [fieldPath]: value,
                    },
                };
            })
        );
    };



    const validateForm = (editedData: AccidentClaimFormData): string[] => {
        const errors: string[] = [];

        formSections.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.required) {
                    const path = field.id.split(".");
                    const value = getNestedValue(editedData, path);
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

        console.log('Edited Data before submitting:', claimToUpdate.editedData);
        console.log('accident_date:', claimToUpdate.editedData.accident_date);

        // Validate required fields
        const validationErrors = validateForm(claimToUpdate.editedData);
        if (validationErrors.length > 0) {
            validationErrors.forEach((error) => toast({
                title: "Validation Error",
                description: error,
            }));
            return; // Prevent submission
        }

        const submitData = new FormData();

        // Append all non-file fields except 'new_file_uploads'
        Object.entries(claimToUpdate.editedData).forEach(([key, value]) => {
            if (key === 'new_file_uploads') return; // Exclude 'new_file_uploads'

            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                // For nested objects, stringify them
                submitData.append(key, JSON.stringify(value));
            } else if (key === "accident_date" && typeof value === "string") {
                // Handle date as a string
                submitData.append(key, value); // Ensure 'value' is in "YYYY-MM-DD" format
            } else if (Array.isArray(value)) {
                // For arrays, stringify the array
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "string") {
                // For simple strings
                submitData.append(key, value);
            }
        });

        // Handle new file uploads
        if (claimToUpdate.editedData.new_file_uploads && claimToUpdate.editedData.new_file_uploads.length > 0) {
            claimToUpdate.editedData.new_file_uploads.forEach((file) => {
                submitData.append("new_file_uploads", file); // Backend expects 'new_file_uploads'
            });
        }

        // Debug: Verify the files in submitData
        submitData.forEach((value, key) => console.log(`${key}:`, value instanceof File ? value.name : value));

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
                const updatedClaim: Claim = responseData.claim; // Ensure 'claim' is returned by backend

                setClaims((prevClaims) =>
                    prevClaims.map((claim) =>
                        claim.claim_id === claim_id
                            ? {
                                ...updatedClaim,
                                isEditing: false,
                                editedData: mapClaimToFormData(updatedClaim, businessId),
                            }
                            : claim
                    )
                );
            } else {
                // If 'claim' is not returned, manually update the claim's editedData without affecting 'file_uploads'
                setClaims((prevClaims) =>
                    prevClaims.map((claim) =>
                        claim.claim_id === claim_id
                            ? {
                                ...claim,
                                isEditing: false,
                                editedData: {
                                    ...claim.editedData,
                                    ...claimToUpdate.editedData,
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
            // Optionally, redirect to dashboard
            // router.push("/dashboard")
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
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 xl:p-8 overflow-y-auto">
            <div className="p-4 mt-8">
                {/* Title Section */}
                <div className="mb-8 flex flex-row items-start justify-between w-full gap-16 text-start">
                    <div className="lg:text-left">
                        <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                            <FaEdit />
                            Your Accident Claims
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">
                            Review and manage your submitted accident claims below.
                            <br />
                            Click on a claim to view or edit its details.
                        </p>
                    </div>
                </div>

                {/* Claims List */}
                {claims.length === 0 ? (
                    <p className="text-center text-white">No claims found.</p>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <ClaimAccordion
                                key={claim.claim_id}
                                claim={claim}
                                toggleEdit={toggleEdit}
                                handleFieldChange={handleFieldChange}
                                handleSave={handleSave}
                                handleCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccidentClaimsView;

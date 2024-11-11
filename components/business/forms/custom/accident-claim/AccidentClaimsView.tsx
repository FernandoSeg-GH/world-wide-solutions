// AccidentClaimsView.tsx

"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaEdit } from "react-icons/fa";
import { useRouter } from 'next/navigation';

import { AccidentClaimFormData, Claim } from "./config/types";
import { mapClaimToFormData } from "./config/form-config";
import ClaimAccordion from "./ClaimAccordion";

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
                        slip_attorney_info: safeJsonParse(claim.slip_attorney_info, 'slip_attorney_info'),
                        slip_costs: safeJsonParse(claim.slip_costs, 'slip_costs'),
                        slip_medical_info: safeJsonParse(claim.slip_medical_info, 'slip_medical_info'),
                        slip_third_party_info: safeJsonParse(claim.slip_third_party_info, 'slip_third_party_info'),
                        // Initialize editing state
                        isEditing: false,
                        editedData: mapClaimToFormData(claim),
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
    }, [session]);

    const toggleEdit = (claim_id: string) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id
                    ? {
                        ...claim,
                        isEditing: !claim.isEditing,
                        editedData: !claim.isEditing ? mapClaimToFormData(claim) : { ...claim.editedData },
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

                // Handle nested file_uploads.new* fields
                if (
                    pathParts.length === 2 &&
                    pathParts[0] === "file_uploads" &&
                    pathParts[1].startsWith("new")
                ) {
                    const newField = pathParts[1];
                    return {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            file_uploads: {
                                ...claim.editedData.file_uploads,
                                [newField]: value,
                            },
                        },
                    };
                }

                // Handle other nested fields
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


    const handleSave = async (claim_id: string) => {
        const claimToUpdate = claims.find((claim) => claim.claim_id === claim_id);
        if (!claimToUpdate || !claimToUpdate.editedData) return;

        console.log('Edited Data before submitting:', claimToUpdate.editedData); // Debugging

        const submitData = new FormData();

        // Append all non-file fields
        Object.entries(claimToUpdate.editedData).forEach(([key, value]) => {
            if (typeof value === "object" && value instanceof FileList) {
                // For FileList, append each file individually
                Array.from(value).forEach(file => submitData.append(key, file));
            } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                // For other objects, stringify
                submitData.append(key, JSON.stringify(value));
            } else if (key === "accident_date" && typeof value === "string") {
                // Handle date as a string
                submitData.append(key, value);
            } else if (Array.isArray(value)) {
                // For arrays, stringify the array
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "string") {
                // For simple strings
                submitData.append(key, value);
            }
        });


        const newFileFields: Array<keyof AccidentClaimFormData['file_uploads']> = [
            "newDocumentFiles",
            "newMvaUploadDocumentation",
            "newMvaRepatriationBills",
            "newMvaOtherFiles",
            "newMvaInsuranceDocs",
            "newMvaBusinessDocs",
            "newMvaCoInsuredDocs",
            "newMvaAttorneyDocs",
            "newSlipAccidentReports",
            "newSlipPhotos",
            "newSlipMedicalDocs",
            "newSlipMedicalBills",
            "newSlipRepatriationBills",
            "newSlipThirdPartyDocs",
            "newSlipBusinessDocs",
            "newSlipCoInsuredDocs",
            "slipCoInsuredDocs",
            "slipThirdPartyDocs"
        ];

        // Append each file in file uploads
        newFileFields.forEach((field) => {
            const files = claimToUpdate.editedData!.file_uploads[field];
            if (files && files instanceof FileList && files.length > 0) {
                Array.from(files).forEach((file) => {
                    console.log(`Appending file for field: ${field}, file name: ${file.name}`);
                    const backendFieldName = field.replace(/^new/, "");
                    submitData.append(backendFieldName, file);
                });
            }
        });

        // Verify the files in submitData
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

            const updatedClaim: Claim = await response.json();

            setClaims((prevClaims) =>
                prevClaims.map((claim) =>
                    claim.claim_id === claim_id
                        ? {
                            ...updatedClaim,
                            isEditing: false,
                            editedData: mapClaimToFormData(updatedClaim),
                        }
                        : claim
                )
            );
            alert("Form submitted successfully!");
            // router.push("/dashboard")
        } catch (err: any) {
            alert(`Failed to submit form: ${err.message || "Unknown error"}`);
        }
    };

    const handleCancel = (claim_id: string) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id
                    ? {
                        ...claim,
                        isEditing: false,
                        editedData: mapClaimToFormData(claim),
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

        <div className="w-full  bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 xl:p-8 overflow-y-auto">
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

"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { PlusCircle } from 'lucide-react'


import { AccidentClaimFormData, Claim } from "../accident-claim-form";
import { mapClaimToFormData } from "./formConfig";
import ClaimAccordion from "./ClaimAccordion";
export interface EditableClaim extends Claim {
    isEditing: boolean;
    editedData: AccidentClaimFormData;
}

const AccidentClaimsView: React.FC = () => {
    const { data: session } = useSession();
    const [claims, setClaims] = useState<EditableClaim[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()

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
                        isEditing: false,
                        editedData: mapClaimToFormData(claim),
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

                if (pathParts.length === 1) {
                    return {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            [fieldPath]: value,
                        },
                    };
                }

                const [section, fieldId] = pathParts;
                return {
                    ...claim,
                    editedData: {
                        ...claim.editedData,
                        [section]: {
                            ...(claim.editedData[section as keyof AccidentClaimFormData] as any),
                            [fieldId]: value,
                        },
                    },
                };
            })
        );
    };

    const handleSave = async (claim_id: string) => {
        const claimToUpdate = claims.find((claim) => claim.claim_id === claim_id);
        if (!claimToUpdate || !claimToUpdate.editedData) return;

        const submitData = new FormData();
        Object.entries(claimToUpdate.editedData).forEach(([key, value]) => {
            if (
                typeof value === "object" &&
                value !== null &&
                !(value instanceof FileList) &&
                !Array.isArray(value)
            ) {
                submitData.append(key, JSON.stringify(value));
            } else if (key === "accident_date" && value instanceof Date) {
                submitData.append(key, value.toISOString());
            } else if (Array.isArray(value)) {
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "string") {
                submitData.append(key, value);
            }
        });

        const fileFields: Array<keyof AccidentClaimFormData> = [
            "documentFiles",
            "mvaUploadDocumentation",
            "mvaRepatriationBills",
            "mvaOtherFiles",
            "mvaInsuranceDocs",
            "mvaBusinessDocs",
            "mvaCoInsuredDocs",
            "mvaAttorneyDocs",
            "slipAccidentReports",
            "slipPhotos",
            "slipMedicalDocs",
            "slipMedicalBills",
            "slipRepatriationBills",
            "slipThirdPartyDocs",
            "slipBusinessDocs",
            "slipCoInsuredDocs",
        ];

        fileFields.forEach((field) => {
            const files = claimToUpdate.editedData![field];
            if (files && files instanceof FileList && files.length > 0) {
                Array.from(files).forEach((file) => {
                    submitData.append(field, file);
                });
            }
        });

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/update_accident_claim/${claim_id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                    body: submitData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update claim.");
            }

            setClaims((prevClaims) =>
                prevClaims.map((claim) =>
                    claim.claim_id === claim_id
                        ? {
                            ...claim,
                            ...claim.editedData,
                            accident_date: claim.editedData.accident_date ? new Date(claim.editedData.accident_date).toISOString() : "",
                            isEditing: false,
                        }
                        : claim
                )
            );
            alert("Form submitted successfully!");
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
            {/* {session?.user.role.id === 1 &&
                <Card className="flex w-full max-w-xl items-center justify-between">
                    <CardHeader>
                        <CardTitle>Accident Claim Report</CardTitle>
                        <p>   Submit a new Accident Claim Report  </p>
                    </CardHeader>
                    <CardDescription className='px-6 flex justify-end'>
                        <Button onClick={() => router.push("/accident-claim")}>New Claim <PlusCircle /></Button>
                    </CardDescription>
                </Card>
            } */}
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
                    {/* Optional Logo/Image */}
                    {/* <Image
                        src="/assets/vws-hor.png"
                        alt="Publicuy Logo"
                        className="h-auto object-contain ml-auto"
                        width={300}
                        height={50}
                    /> */}
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

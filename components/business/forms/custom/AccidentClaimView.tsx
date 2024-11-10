"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    FaEdit,
    FaSave,
    FaTimes,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaFileUpload,
    FaDollarSign,
    FaUserTie,
    FaUserFriends,
    FaBuilding,
    FaHeartbeat,
    FaCarSide,
    FaCar,
    FaWalking,
    FaPaperPlane,
    FaUsers,
} from "react-icons/fa";
import FileUpload from "@/components/ui/file-upload";
import { useSession } from "next-auth/react";
import { AccidentClaimFormData, Claim } from "./accident-claim-form";
import { countryOptions } from "@/components/business/forms/custom/country-options";
import { usaStates } from "@/components/business/forms/custom/state-options";
import { accidentTypeOptions } from "@/components/business/forms/custom/accident-options";

interface EditableClaim extends Claim {
    isEditing?: boolean;
    editedData?: Partial<Claim>;
}

export default function AccidentClaimsView() {
    const { data: session } = useSession();
    const [claims, setClaims] = useState<EditableClaim[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
                const initializedClaims: EditableClaim[] = data.claims.map(
                    (claim: Claim) => ({
                        ...claim,
                        isEditing: false,
                        editedData: { ...claim },
                    })
                );
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
                    ? { ...claim, isEditing: !claim.isEditing, editedData: { ...claim } }
                    : claim
            )
        );
    };

    const handleInputChange = (claim_id: string, field: keyof Claim, value: any) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id && claim.editedData
                    ? {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            [field]: value,
                        },
                    }
                    : claim
            )
        );
    };

    const handleNestedInputChange = (
        claim_id: string,
        section: keyof Claim,
        field: string,
        value: any
    ) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id &&
                    claim.editedData &&
                    typeof claim.editedData[section] === "object" &&
                    claim.editedData[section] !== null
                    ? {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            [section]: {
                                ...claim.editedData[section],
                                [field]: value,
                            },
                        },
                    }
                    : claim
            )
        );
    };

    const handleFileUpload = (
        claim_id: string,
        field: keyof AccidentClaimFormData,
        files: FileList | null
    ) => {
        setClaims((prevClaims) =>
            prevClaims.map((claim) =>
                claim.claim_id === claim_id && claim.editedData
                    ? {
                        ...claim,
                        editedData: {
                            ...claim.editedData,
                            [field]: files,
                        },
                    }
                    : claim
            )
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
            } else if (key === "accident_date" && typeof value === "string") {
                submitData.append(key, new Date(value).toISOString());
            } else if (Array.isArray(value)) {
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "string") {
                submitData.append(key, value);
            }
        });

        const fileFields: Array<keyof Claim> = [
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
                        ? { ...claim, ...claim.editedData, isEditing: false }
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
                    ? { ...claim, isEditing: false, editedData: { ...claim } }
                    : claim
            )
        );
    };

    const renderSection = (
        title: string,
        icon: JSX.Element,
        children: React.ReactNode
    ) => (
        <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );

    if (loading) return <div className="text-center text-white">Loading...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-navyBlue dark:text-white">
                Your Accident Claims
            </h1>
            {claims.length === 0 ? (
                <p className="text-center text-white">No claims found.</p>
            ) : (
                claims.map((claim) => (
                    <div
                        key={claim.claim_id}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6"
                    >
                        {claim.isEditing ? (
                            <div>
                                {/* Editable Mode */}
                                {/* Patient Personal Information */}
                                {renderSection(
                                    "Patient Personal Information",
                                    <FaUser />,
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor={`full_name_${claim.claim_id}`}>
                                                Full Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`full_name_${claim.claim_id}`}
                                                name="full_name"
                                                value={claim?.editedData?.full_name || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "full_name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter full name"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`email_${claim.claim_id}`}>
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`email_${claim.claim_id}`}
                                                name="email"
                                                type="email"
                                                value={claim?.editedData?.email || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter email"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`country_${claim.claim_id}`}>
                                                Country <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={claim?.editedData?.country || ""}
                                                onValueChange={(value) =>
                                                    handleInputChange(claim.claim_id, "country", value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your country" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[320px] overflow-y-auto">
                                                    {countryOptions.map((country) => (
                                                        <SelectItem key={country.value} value={country.value}>
                                                            {country.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor={`state_${claim.claim_id}`}>
                                                State <span className="text-red-500">*</span>
                                            </Label>
                                            {claim?.editedData?.country?.toLowerCase() === "usa" ||
                                                claim?.editedData?.country?.toLowerCase() ===
                                                "united_states" ? (
                                                <Select
                                                    value={claim?.editedData?.state || ""}
                                                    onValueChange={(value) =>
                                                        handleInputChange(claim.claim_id, "state", value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your state" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {usaStates.map((state) => (
                                                            <SelectItem key={state.value} value={state.value}>
                                                                {state.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id={`state_${claim.claim_id}`}
                                                    name="state"
                                                    value={claim?.editedData?.state || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "state",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your state"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor={`primary_contact_${claim.claim_id}`}>
                                                Primary Contact Phone Number{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`primary_contact_${claim.claim_id}`}
                                                name="primary_contact"
                                                value={claim?.editedData?.primary_contact || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "primary_contact",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="+1 234 567 890"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`other_contact_name_${claim.claim_id}`}>
                                                Relative or Friend{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`other_contact_name_${claim.claim_id}`}
                                                name="other_contact_name"
                                                value={claim?.editedData?.other_contact_name || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "other_contact_name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter name"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`other_contact_phone_${claim.claim_id}`}>
                                                Other Contact Phone Number{" "}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`other_contact_phone_${claim.claim_id}`}
                                                name="other_contact_phone"
                                                value={claim?.editedData?.other_contact_phone || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "other_contact_phone",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="+1 234 567 890"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Continue rendering other sections similarly */}
                                {/* Accident Information */}
                                {renderSection(
                                    "Accident Information",
                                    <FaCarSide />,
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor={`accident_date_${claim.claim_id}`}>
                                                Accident Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`accident_date_${claim.claim_id}`}
                                                name="accident_date"
                                                type="date"
                                                value={claim?.editedData?.accident_date || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "accident_date",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`accident_place_${claim.claim_id}`}>
                                                Accident Place <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`accident_place_${claim.claim_id}`}
                                                name="accident_place"
                                                value={claim?.editedData?.accident_place || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "accident_place",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter accident location"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`accident_type_${claim.claim_id}`}>
                                                Accident Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={claim?.editedData?.accident_type || ""}
                                                onValueChange={(value) =>
                                                    handleInputChange(claim.claim_id, "accident_type", value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select accident type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accidentTypeOptions.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor={`sub_accident_type_${claim.claim_id}`}>
                                                Sub Accident Type
                                            </Label>
                                            <Input
                                                id={`sub_accident_type_${claim.claim_id}`}
                                                name="sub_accident_type"
                                                value={claim?.editedData?.sub_accident_type || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "sub_accident_type",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter sub accident type"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Motor Vehicle Accident Details */}
                                {renderSection(
                                    "Motor Vehicle Accident Details",
                                    <FaCar />,
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor={`mva_type_${claim.claim_id}`}>
                                                    MVA Type <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id={`mva_type_${claim.claim_id}`}
                                                    name="mva_type"
                                                    value={claim?.editedData?.mva_type || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "mva_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter MVA type"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`mva_location_${claim.claim_id}`}>
                                                    MVA Location <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id={`mva_location_${claim.claim_id}`}
                                                    name="mva_location"
                                                    value={claim?.editedData?.mva_location || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "mva_location",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter MVA location"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Vehicle Details */}
                                        <div>
                                            <Label>
                                                Vehicle Details <span className="text-red-500">*</span>
                                            </Label>
                                            {claim?.editedData?.vehicle_details?.map((vehicle, index) => (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                                    <div>
                                                        <Label htmlFor={`insuranceName_${claim.claim_id}_${index}`}>
                                                            Insurance Name
                                                        </Label>
                                                        <Input
                                                            id={`insuranceName_${claim.claim_id}_${index}`}
                                                            name="insuranceName"
                                                            value={vehicle.insuranceName}
                                                            onChange={(e) =>
                                                                setClaims((prevClaims) =>
                                                                    prevClaims.map((c) =>
                                                                        c.claim_id === claim.claim_id
                                                                            ? {
                                                                                ...c,
                                                                                editedData: {
                                                                                    ...c.editedData,
                                                                                    vehicle_details: c.editedData?.vehicle_details?.map(
                                                                                        (vd, i) =>
                                                                                            i === index
                                                                                                ? { ...vd, insuranceName: e.target.value }
                                                                                                : vd
                                                                                    ),
                                                                                },
                                                                            }
                                                                            : c
                                                                    )
                                                                )
                                                            }
                                                            placeholder="Enter insurance name"
                                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`policyNumber_${claim.claim_id}_${index}`}>
                                                            Policy Number
                                                        </Label>
                                                        <Input
                                                            id={`policyNumber_${claim.claim_id}_${index}`}
                                                            name="policyNumber"
                                                            value={vehicle.policyNumber}
                                                            onChange={(e) =>
                                                                setClaims((prevClaims) =>
                                                                    prevClaims.map((c) =>
                                                                        c.claim_id === claim.claim_id
                                                                            ? {
                                                                                ...c,
                                                                                editedData: {
                                                                                    ...c.editedData,
                                                                                    vehicle_details: c.editedData?.vehicle_details?.map(
                                                                                        (vd, i) =>
                                                                                            i === index
                                                                                                ? { ...vd, policyNumber: e.target.value }
                                                                                                : vd
                                                                                    ),
                                                                                },
                                                                            }
                                                                            : c
                                                                    )
                                                                )
                                                            }
                                                            placeholder="Enter policy number"
                                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setClaims((prevClaims) =>
                                                        prevClaims.map((c) =>
                                                            c.claim_id === claim.claim_id
                                                                ? {
                                                                    ...c,
                                                                    editedData: {
                                                                        ...c.editedData,
                                                                        vehicle_details: [
                                                                            ...c.editedData?.vehicle_details!,
                                                                            { insuranceName: "", policyNumber: "" },
                                                                        ],
                                                                    },
                                                                }
                                                                : c
                                                        )
                                                    )
                                                }
                                            >
                                                Add Vehicle
                                            </Button>
                                        </div>

                                        <div>
                                            <Label htmlFor={`selected_vehicle_${claim.claim_id}`}>
                                                Selected Vehicle
                                            </Label>
                                            <Input
                                                id={`selected_vehicle_${claim.claim_id}`}
                                                name="selected_vehicle"
                                                value={claim?.editedData?.selected_vehicle || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "selected_vehicle",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter selected vehicle"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`mva_description_${claim.claim_id}`}>
                                                MVA Description
                                            </Label>
                                            <Textarea
                                                id={`mva_description_${claim.claim_id}`}
                                                name="mva_description"
                                                value={claim?.editedData?.mva_description || ""}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        claim.claim_id,
                                                        "mva_description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Describe the accident"
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>

                                        {/* MVA Medical Information */}
                                        {renderSection(
                                            "MVA Medical Information",
                                            <FaHeartbeat />,
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor={`mva_medical_assistanceType_${claim.claim_id}`}>
                                                        Assistance Type
                                                    </Label>
                                                    <Input
                                                        id={`mva_medical_assistanceType_${claim.claim_id}`}
                                                        name="assistanceType"
                                                        value={claim?.editedData?.mva_medical_info?.assistanceType || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_medical_info",
                                                                "assistanceType",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter assistance type"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_medical_diagnosis_${claim.claim_id}`}>
                                                        Diagnosis
                                                    </Label>
                                                    <Input
                                                        id={`mva_medical_diagnosis_${claim.claim_id}`}
                                                        name="diagnosis"
                                                        value={claim?.editedData?.mva_medical_info?.diagnosis || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_medical_info",
                                                                "diagnosis",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter diagnosis"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_medical_treatment_${claim.claim_id}`}>
                                                        Treatment
                                                    </Label>
                                                    <Input
                                                        id={`mva_medical_treatment_${claim.claim_id}`}
                                                        name="treatment"
                                                        value={claim?.editedData?.mva_medical_info?.treatment || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_medical_info",
                                                                "treatment",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter treatment details"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_medical_primaryCareProvider_${claim.claim_id}`}>
                                                        Primary Care Provider
                                                    </Label>
                                                    <Input
                                                        id={`mva_medical_primaryCareProvider_${claim.claim_id}`}
                                                        name="primaryCareProvider"
                                                        value={claim?.editedData?.mva_medical_info?.primaryCareProvider || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_medical_info",
                                                                "primaryCareProvider",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter primary care provider"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* MVA Costs */}
                                        {renderSection(
                                            "MVA Cost of Assistance",
                                            <FaDollarSign />,
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor={`mva_costs_totalCost_${claim.claim_id}`}>
                                                        Total Cost
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_totalCost_${claim.claim_id}`}
                                                        name="totalCost"
                                                        type="number"
                                                        value={claim?.editedData?.mva_costs?.totalCost || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "totalCost",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter total cost"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_costs_policyLimits_${claim.claim_id}`}>
                                                        Policy Limits
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_policyLimits_${claim.claim_id}`}
                                                        name="policyLimits"
                                                        type="number"
                                                        value={claim?.editedData?.mva_costs?.policyLimits || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "policyLimits",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter policy limits"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_costs_assistanceStatus_${claim.claim_id}`}>
                                                        Assistance Status
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_assistanceStatus_${claim.claim_id}`}
                                                        name="assistanceStatus"
                                                        value={claim?.editedData?.mva_costs?.assistanceStatus || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "assistanceStatus",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter assistance status"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_costs_medicalProviderCosts_${claim.claim_id}`}>
                                                        Medical Provider Costs
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_medicalProviderCosts_${claim.claim_id}`}
                                                        name="medicalProviderCosts"
                                                        type="number"
                                                        value={claim?.editedData?.mva_costs?.medicalProviderCosts || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "medicalProviderCosts",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter medical provider costs"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_costs_repatriationCosts_${claim.claim_id}`}>
                                                        Repatriation Costs
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_repatriationCosts_${claim.claim_id}`}
                                                        name="repatriationCosts"
                                                        type="number"
                                                        value={claim?.editedData?.mva_costs?.repatriationCosts || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "repatriationCosts",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter repatriation costs"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_costs_otherCosts_${claim.claim_id}`}>
                                                        Other Costs
                                                    </Label>
                                                    <Input
                                                        id={`mva_costs_otherCosts_${claim.claim_id}`}
                                                        name="otherCosts"
                                                        type="number"
                                                        value={claim?.editedData?.mva_costs?.otherCosts || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_costs",
                                                                "otherCosts",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter other costs"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* MVA Third Party Information */}
                                        {renderSection(
                                            "MVA Third Party Information",
                                            <FaUserFriends />,
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor={`mva_third_party_insuranceCompany_${claim.claim_id}`}>
                                                        Insurance Company
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_insuranceCompany_${claim.claim_id}`}
                                                        name="insuranceCompany"
                                                        value={claim?.editedData?.mva_third_party_info?.insuranceCompany || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "insuranceCompany",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter insurance company"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_claimReferenceNumber_${claim.claim_id}`}>
                                                        Claim Reference Number
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_claimReferenceNumber_${claim.claim_id}`}
                                                        name="claimReferenceNumber"
                                                        value={claim?.editedData?.mva_third_party_info?.claimReferenceNumber || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "claimReferenceNumber",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter claim reference number"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_adjusterName_${claim.claim_id}`}>
                                                        Adjuster Name
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_adjusterName_${claim.claim_id}`}
                                                        name="adjusterName"
                                                        value={claim?.editedData?.mva_third_party_info?.adjusterName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "adjusterName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter adjuster name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_adjusterContactDetails_${claim.claim_id}`}>
                                                        Adjuster Contact Details
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_adjusterContactDetails_${claim.claim_id}`}
                                                        name="adjusterContactDetails"
                                                        value={claim?.editedData?.mva_third_party_info?.adjusterContactDetails || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "adjusterContactDetails",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter adjuster contact details"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_ownerBusinessName_${claim.claim_id}`}>
                                                        Owner/Business Name
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_ownerBusinessName_${claim.claim_id}`}
                                                        name="ownerBusinessName"
                                                        value={claim?.editedData?.mva_third_party_info?.ownerBusinessName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "ownerBusinessName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter owner/business name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_ownerReferenceNumber_${claim.claim_id}`}>
                                                        Owner Reference Number
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_ownerReferenceNumber_${claim.claim_id}`}
                                                        name="ownerReferenceNumber"
                                                        value={claim?.editedData?.mva_third_party_info?.ownerReferenceNumber || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "ownerReferenceNumber",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter owner reference number"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_ownerPhoneNumber_${claim.claim_id}`}>
                                                        Owner Phone Number
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_ownerPhoneNumber_${claim.claim_id}`}
                                                        name="ownerPhoneNumber"
                                                        value={claim?.editedData?.mva_third_party_info?.ownerPhoneNumber || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "ownerPhoneNumber",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="+1 234 567 890"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_coInsured_${claim.claim_id}`}>
                                                        Co-Insured
                                                    </Label>
                                                    <Input
                                                        id={`mva_third_party_coInsured_${claim.claim_id}`}
                                                        name="coInsured"
                                                        value={claim?.editedData?.mva_third_party_info?.coInsured || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "coInsured",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter co-insured name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_third_party_otherPartyInfo_${claim.claim_id}`}>
                                                        Other Party Information
                                                    </Label>
                                                    <Textarea
                                                        id={`mva_third_party_otherPartyInfo_${claim.claim_id}`}
                                                        name="otherPartyInfo"
                                                        value={claim?.editedData?.mva_third_party_info?.otherPartyInfo || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_third_party_info",
                                                                "otherPartyInfo",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter other party information"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* MVA Personal Attorney */}
                                        {renderSection(
                                            "MVA Personal Attorney",
                                            <FaUserTie />,
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor={`mva_attorney_info_lawFirmName_${claim.claim_id}`}>
                                                        Law Firm Name
                                                    </Label>
                                                    <Input
                                                        id={`mva_attorney_info_lawFirmName_${claim.claim_id}`}
                                                        name="lawFirmName"
                                                        value={claim?.editedData?.mva_attorney_info?.lawFirmName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_attorney_info",
                                                                "lawFirmName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter law firm name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_attorney_info_attorneyName_${claim.claim_id}`}>
                                                        Attorney Name
                                                    </Label>
                                                    <Input
                                                        id={`mva_attorney_info_attorneyName_${claim.claim_id}`}
                                                        name="attorneyName"
                                                        value={claim?.editedData?.mva_attorney_info?.attorneyName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_attorney_info",
                                                                "attorneyName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter attorney name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`mva_attorney_info_attorneyPhone_${claim.claim_id}`}>
                                                        Attorney Phone
                                                    </Label>
                                                    <Input
                                                        id={`mva_attorney_info_attorneyPhone_${claim.claim_id}`}
                                                        name="attorneyPhone"
                                                        value={claim?.editedData?.mva_attorney_info?.attorneyPhone || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "mva_attorney_info",
                                                                "attorneyPhone",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="+1 234 567 890"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Slip and Fall Accident Details */}
                                {renderSection(
                                    "Slip and Fall Accident Details",
                                    <FaWalking />,
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor={`slip_description_${claim.claim_id}`}>
                                                    Slip Description <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id={`slip_description_${claim.claim_id}`}
                                                    name="slip_description"
                                                    value={claim?.editedData?.slip_description || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "slip_description",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Describe the slip and fall accident"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`slip_accident_type_${claim.claim_id}`}>
                                                    Slip Accident Type <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id={`slip_accident_type_${claim.claim_id}`}
                                                    name="slip_accident_type"
                                                    value={claim?.editedData?.slip_accident_type || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "slip_accident_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter slip accident type"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`negligence_description_${claim.claim_id}`}>
                                                    Negligence Description
                                                </Label>
                                                <Textarea
                                                    id={`negligence_description_${claim.claim_id}`}
                                                    name="negligence_description"
                                                    value={claim?.editedData?.negligence_description || ""}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            claim.claim_id,
                                                            "negligence_description",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Describe any negligence involved"
                                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Witness Information */}
                                        {renderSection(
                                            "Witness Information",
                                            <FaUsers />,
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <Label htmlFor={`witness_info_name_${claim.claim_id}`}>
                                                        Witness Name
                                                    </Label>
                                                    <Input
                                                        id={`witness_info_name_${claim.claim_id}`}
                                                        name="name"
                                                        value={claim?.editedData?.witness_info?.name || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "witness_info",
                                                                "name",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter witness name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`witness_info_email_${claim.claim_id}`}>
                                                        Witness Email
                                                    </Label>
                                                    <Input
                                                        id={`witness_info_email_${claim.claim_id}`}
                                                        name="email"
                                                        type="email"
                                                        value={claim?.editedData?.witness_info?.email || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "witness_info",
                                                                "email",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter witness email"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`witness_info_phone_${claim.claim_id}`}>
                                                        Witness Phone
                                                    </Label>
                                                    <Input
                                                        id={`witness_info_phone_${claim.claim_id}`}
                                                        name="phone"
                                                        value={claim?.editedData?.witness_info?.phone || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "witness_info",
                                                                "phone",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="+1 234 567 890"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        ......moresecitons

                                        {/* Slip Personal Attorney */}
                                        {renderSection(
                                            "Slip Personal Attorney",
                                            <FaUserTie />,
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor={`slip_attorney_info_lawFirmName_${claim.claim_id}`}>
                                                        Law Firm Name
                                                    </Label>
                                                    <Input
                                                        id={`slip_attorney_info_lawFirmName_${claim.claim_id}`}
                                                        name="lawFirmName"
                                                        value={claim?.editedData?.slip_attorney_info?.lawFirmName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "slip_attorney_info",
                                                                "lawFirmName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter law firm name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`slip_attorney_info_attorneyName_${claim.claim_id}`}>
                                                        Attorney Name
                                                    </Label>
                                                    <Input
                                                        id={`slip_attorney_info_attorneyName_${claim.claim_id}`}
                                                        name="attorneyName"
                                                        value={claim?.editedData?.slip_attorney_info?.attorneyName || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "slip_attorney_info",
                                                                "attorneyName",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter attorney name"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`slip_attorney_info_attorneyPhone_${claim.claim_id}`}>
                                                        Attorney Phone
                                                    </Label>
                                                    <Input
                                                        id={`slip_attorney_info_attorneyPhone_${claim.claim_id}`}
                                                        name="attorneyPhone"
                                                        value={claim?.editedData?.slip_attorney_info?.attorneyPhone || ""}
                                                        onChange={(e) =>
                                                            handleNestedInputChange(
                                                                claim.claim_id,
                                                                "slip_attorney_info",
                                                                "attorneyPhone",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="+1 234 567 890"
                                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Medical Information */}
                                {/* Cost of Assistance */}
                                {/* Third Party Information */}
                                {/* Personal Attorney */}
                                {/* Additional Notes */}
                                {renderSection(
                                    "Additional Notes",
                                    <FaPaperPlane />,
                                    <div>
                                        <Label htmlFor={`additional_notes_${claim.claim_id}`}>
                                            Additional Notes
                                        </Label>
                                        <Textarea
                                            id={`additional_notes_${claim.claim_id}`}
                                            name="additional_notes"
                                            value={claim?.editedData?.additional_notes || ""}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    claim.claim_id,
                                                    "additional_notes",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter any additional notes"
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                )}

                                {/* File Uploads */}


                                {/* Save and Cancel Buttons */}
                                <div className="flex justify-end mt-6">
                                    <Button
                                        onClick={() => handleCancel(claim.claim_id)}
                                        variant="secondary"
                                        className="mr-2"
                                    >
                                        <FaTimes className="mr-2" />
                                        Cancel
                                    </Button>
                                    <Button onClick={() => handleSave(claim.claim_id)}>
                                        <FaSave className="mr-2" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {/* View Mode */}
                                {/* Display claim details here */}
                                {/* Include an Edit button to toggle editing mode */}
                                <Button onClick={() => toggleEdit(claim.claim_id)}>
                                    <FaEdit className="mr-2" />
                                    Edit
                                </Button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

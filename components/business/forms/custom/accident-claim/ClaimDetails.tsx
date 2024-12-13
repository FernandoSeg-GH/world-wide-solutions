// components/ClaimDetails.tsx
"use client";

import React, { useMemo, useState } from "react";
import { EditableClaim, AccidentClaimFormData, VehicleDetail, CostDetail } from "./config/types";
import {
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaFileUpload,
    FaDollarSign,
    FaUserTie,
    FaUserFriends,
    FaBuilding,
    FaUsers,
    FaHeartbeat,
    FaCarSide,
    FaCar,
    FaWalking,
    FaPlusCircle,
} from "react-icons/fa";
import { Ellipsis, Hospital, LoaderCircle, PlaneTakeoff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import { usaStates } from "@/components/business/forms/custom/accident-claim/config/state-options";
import { countryOptions } from "@/components/business/forms/custom/accident-claim/config/country-options";
import { accidentTypeOptions } from "@/components/business/forms/custom/accident-claim/config/accident-options";
import { currencyOptions } from "./config/currencies";
import DatePicker from "@/components/ui/date-picker";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import CustomPhoneInput from "@/components/ui/phone-input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectItem } from "@radix-ui/react-select";
import JSZip from "jszip";

interface ClaimDetailsProps {
    claim: EditableClaim;
    pdf: string;
    onEdit: (claim_id: string) => void;
    handleSave: (claim_id: string) => void;
    handleCancel: (claim_id: string) => void;
    handleFieldChange: (claim_id: string, fieldPath: string, value: any) => void;
}

export default function ClaimDetails({
    claim,
    onEdit,
    handleSave,
    handleCancel,
    handleFieldChange,
    pdf
}: ClaimDetailsProps): React.JSX.Element {
    const { isEditing, editedData } = claim;
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const data = isEditing ? editedData : claim;

    const isUSA = useMemo(() => {
        const c = (data.country || "").toLowerCase();
        return c === "usa" || c === "united_states";
    }, [data.country]);

    const isUSAbis = useMemo(() => {
        const ac = (data.accident_country || "").toLowerCase();
        return ac === "usa" || ac === "united_states";
    }, [data.accident_country]);

    const existingFiles = useMemo(() => {
        if (!data.file_uploads) return [];
        if (Array.isArray(data.file_uploads)) return data.file_uploads;
        try {
            return JSON.parse(data.file_uploads);
        } catch (e) {
            console.error("Error parsing file uploads:", e);
            return [];
        }
    }, [data.file_uploads]);


    const vehicleDetails = Array.isArray(data.vehicle_details) ? data.vehicle_details : [];
    const selectedAccidentType = accidentTypeOptions.find((opt) => opt.value === data.accident_type);

    const renderViewField = (label: string, value: any, placeholder: string = "N/A") => {
        // Render label and value inline with margin for view mode
        return (
            <div className="flex items-baseline flex-wrap mb-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">{label}:</span>
                <span className="text-gray-700 dark:text-gray-300 capitalize">{(value || value === 0) ? String(value) : placeholder}</span>
            </div>
        );
    };

    // For fields that require multiple lines (like textarea) in view mode, we can still inline them
    // or just render the text. We'll keep it inline for consistency.
    const renderViewText = (label: string, value: any, placeholder: string = "N/A") => {
        return renderViewField(label, value, placeholder);
    };

    const handleFileDownload = async (fileUrl: string) => {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const fileName = fileUrl.split("/").pop() || "Download";
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            toast({ title: "Error", description: "Failed to download file.", variant: "destructive" });
        }
    };


    const handleDownloadAll = async (fileUrls: string[]) => {
        try {
            if (!fileUrls || fileUrls.length === 0) {
                throw new Error("No files available for download.");
            }

            const zip = new JSZip();

            for (const fileUrl of fileUrls) {
                try {
                    const response = await fetch(fileUrl);
                    if (!response.ok) {
                        console.error(`Failed to fetch ${fileUrl}:`, response.statusText);
                        throw new Error(`Failed to fetch file: ${fileUrl}`);
                    }

                    const blob = await response.blob();
                    const fileName = fileUrl.split("/").pop() || "file";
                    zip.file(fileName, blob);
                } catch (innerError) {
                    console.error("Error processing file:", fileUrl, innerError);
                    toast({
                        title: "File Download Error",
                        description: `Failed to download: ${fileUrl}`,
                        variant: "destructive",
                    });
                }
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = window.URL.createObjectURL(zipBlob);
            const link = document.createElement("a");
            link.href = zipUrl;
            link.download = "all_files.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(zipUrl);

            toast({
                title: "Success",
                description: "Files downloaded successfully!",
            });
        } catch (error) {
            console.error("Download All Error:", error);
            toast({
                title: "Download Error",
                description: "Failed to download files.",
                variant: "destructive",
            });
        }
    };


    const renderExistingFiles = (files?: string[] | string | null) => {
        let validFiles: string[] = [];

        // Handle different file formats: empty array, stringified array, or null
        if (Array.isArray(files)) {
            validFiles = files;
        } else if (typeof files === "string" && files.trim().length > 0) {
            try {
                const parsedFiles = JSON.parse(files);
                if (Array.isArray(parsedFiles)) {
                    validFiles = parsedFiles;
                } else {
                    console.error("Expected an array but got:", parsedFiles);
                }
            } catch (e) {
                console.error("Failed to parse file_uploads as JSON:", files, e);
            }
        }

        if (validFiles.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No existing files</span>;
        }

        return (
            <div className="space-y-2">
                {validFiles.map((fileUrl, index) => {
                    const fileName = fileUrl.split("/").pop() || "Download";
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 p-2 rounded"
                        >
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate"
                            >
                                {fileName}
                            </a>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileDownload(fileUrl)}
                                className="text-gray-500 dark:text-gray-300"
                            >
                                Download
                            </Button>
                        </div>
                    );
                })}
                {/* {validFiles.length > 1 && (
                    <Button
                        onClick={() => handleDownloadAll(validFiles)}
                        className="hover:underline text-blue-600 dark:text-blue-400"
                    >
                        Download All Files
                    </Button>
                )} */}
            </div>
        );
    };


    // Vehicle details editing
    const addVehicle = () => {
        const newVehicle: VehicleDetail = {
            licenseNumber: "",
            year: "",
            model: "",
            insuranceName: "",
            policyNumber: "",
        };
        handleFieldChange(claim.claim_id, `vehicle_details`, [...vehicleDetails, newVehicle]);
    };
    const handleVehicleDetailChange = (index: number, field: keyof VehicleDetail, value: string) => {
        const updated = [...vehicleDetails];
        updated[index] = { ...updated[index], [field]: value };
        handleFieldChange(claim.claim_id, `vehicle_details`, updated);
    };
    const handleRemoveVehicle = (index: number) => {
        const updated = vehicleDetails.filter((_, i) => i !== index);
        handleFieldChange(claim.claim_id, `vehicle_details`, updated);
    };


    // Costs
    const renderCostSection = (
        costType: keyof AccidentClaimFormData,
        title: string,
        icon: React.ReactNode
    ) => {
        const costs: CostDetail[] = Array.isArray(data[costType])
            ? (data[costType] as CostDetail[])
            : [];

        const addCost = () => {
            const newCost: CostDetail = {
                providerName: "",
                amountBilled: "",
                amountPaid: "",
                amountUnpaid: "",
                currency: "USD",
            };
            handleFieldChange(claim.claim_id, costType as string, [...costs, newCost]);
        };

        const handleCostChange = (index: number, field: keyof CostDetail, value: string) => {
            const updated = [...costs];
            updated[index] = { ...updated[index], [field]: value };

            if (field === "amountBilled" || field === "amountPaid") {
                const billed = parseFloat(updated[index].amountBilled || "");
                const paid = parseFloat(updated[index].amountPaid || "");
                updated[index].amountUnpaid = (billed - paid).toString();
            }
            handleFieldChange(claim.claim_id, costType as string, updated);
        };

        const removeCost = (index: number) => {
            const updated = costs.filter((_, i) => i !== index);
            handleFieldChange(claim.claim_id, costType as string, updated);
        };

        return (
            <div>
                <div className="md:col-span-2 my-4 border-b">
                    <div className="flex justify-between items-start">
                        <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            {icon}
                            {title}
                        </h3>
                        {isEditing && (
                            <Button onClick={addCost} type="button">
                                <FaPlusCircle className="mr-2 h-5 w-5" />
                                Add {title.split(" ")[0]} Bill
                            </Button>
                        )}
                    </div>
                </div>
                {costs.length === 0 && !isEditing && (
                    <span className="text-gray-500 dark:text-gray-400">No costs recorded</span>
                )}
                {costs.map((cost, index) => (
                    <div key={index} className="border p-4 my-4 rounded mb-4 bg-gray-50 dark:bg-gray-600">
                        {isEditing ? (
                            <>
                                <Label>Name of Provider</Label>
                                <Input
                                    placeholder="Name of provider"
                                    value={cost.providerName}
                                    onChange={(e) => handleCostChange(index, 'providerName', e.target.value)}
                                    className="mb-2"
                                />
                                <Label>Amount Billed</Label>
                                <div className="flex items-center gap-2 mb-2">
                                    {/* <select
                                        className="border rounded p-2"
                                        value={cost.currency}
                                        onChange={(e) => handleCostChange(index, 'currency', e.target.value)}
                                    >
                                        {currencyOptions.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select> */}
                                    <Select value={cost.currency} onValueChange={(val) => handleCostChange(index, 'currency', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue className="">{cost.currency}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">

                                            {currencyOptions.map((c) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Amount billed"
                                        value={cost.amountBilled}
                                        onChange={(e) => handleCostChange(index, 'amountBilled', e.target.value)}
                                    />
                                </div>

                                <Label>Amount Paid</Label>
                                <div className="flex items-center gap-2 mb-2">
                                    {/* <select
                                        className="border rounded p-2"
                                        value={cost.currency}
                                        onChange={(e) => handleCostChange(index, 'currency', e.target.value)}
                                    >
                                        {currencyOptions.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select> */}
                                    <Select value={cost.currency} onValueChange={(val) => handleCostChange(index, 'currency', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue className="">{cost.currency}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {currencyOptions.map((c) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <Input
                                        placeholder="Amount paid"
                                        value={cost.amountPaid}
                                        onChange={(e) => handleCostChange(index, 'amountPaid', e.target.value)}
                                    />
                                </div>

                                <Label>Amount Unpaid</Label>
                                <div className="flex items-center gap-2 mb-2">
                                    {/* <select
                                        className="border rounded p-2"
                                        value={cost.currency}
                                        onChange={(e) => handleCostChange(index, 'currency', e.target.value)}
                                    >
                                        {currencyOptions.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select> */}
                                    <Select value={cost.currency} onValueChange={(val) => handleCostChange(index, 'currency', val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue className="">{cost.currency}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {currencyOptions.map((c) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Amount unpaid"
                                        value={cost.amountUnpaid}
                                        onChange={(e) => handleCostChange(index, 'amountUnpaid', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => removeCost(index)}
                                    className="mt-4"
                                    type="button"
                                >
                                    Remove
                                </Button>
                            </>
                        ) : (
                            <>
                                {renderViewField("Provider", cost.providerName, "N/A")}
                                {renderViewField("Billed", cost.amountBilled ? cost.amountBilled + " " + cost.currency : "0", "0")}
                                {renderViewField("Paid", cost.amountPaid ? cost.amountPaid + " " + cost.currency : "0", "0")}
                                {renderViewField("Unpaid", cost.amountUnpaid ? cost.amountUnpaid + " " + cost.currency : "0", "0")}
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderVehicleSection = () => {
        if (!isEditing && vehicleDetails.length === 0) {
            return (
                <span className="text-gray-500 dark:text-gray-400">
                    No vehicle details provided
                </span>
            );
        }
        return (
            <div className="space-y-6 mt-3">
                {vehicleDetails.map((vehicle, index) => (
                    <div
                        key={index}
                        className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 mt-6"
                    >
                        <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                            Vehicle #{index + 1} Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>License Number</Label>
                                {isEditing ? (
                                    <Input
                                        placeholder="License Number"
                                        value={vehicle.licenseNumber}
                                        onChange={(e) => handleVehicleDetailChange(index, 'licenseNumber', e.target.value)}
                                    />
                                ) : renderViewField("License Number", vehicle.licenseNumber)}
                            </div>
                            <div>
                                <Label>Year of the Vehicle</Label>
                                {isEditing ? (
                                    <Input
                                        placeholder="Year"
                                        value={vehicle.year}
                                        onChange={(e) => handleVehicleDetailChange(index, 'year', e.target.value)}
                                    />
                                ) : renderViewField("Year", vehicle.year)}
                            </div>
                            <div>
                                <Label>Model of the Vehicle</Label>
                                {isEditing ? (
                                    <Input
                                        placeholder="Model"
                                        value={vehicle.model}
                                        onChange={(e) => handleVehicleDetailChange(index, 'model', e.target.value)}
                                    />
                                ) : renderViewField("Model", vehicle.model)}
                            </div>
                            <div>
                                <Label>Insurance Company Name</Label>
                                {isEditing ? (
                                    <Input
                                        placeholder="Insurance Company Name"
                                        value={vehicle.insuranceName}
                                        onChange={(e) => handleVehicleDetailChange(index, 'insuranceName', e.target.value)}
                                    />
                                ) : renderViewField("Insurance Company Name", vehicle.insuranceName)}
                            </div>
                            <div>
                                <Label>Policy Number</Label>
                                {isEditing ? (
                                    <Input
                                        placeholder="Policy Number"
                                        value={vehicle.policyNumber}
                                        onChange={(e) => handleVehicleDetailChange(index, 'policyNumber', e.target.value)}
                                    />
                                ) : renderViewField("Policy Number", vehicle.policyNumber)}
                            </div>
                        </div>
                        {isEditing && (
                            <Button
                                variant="destructive"
                                onClick={() => handleRemoveVehicle(index)}
                                className="hover:underline mt-4"
                                type="button"
                            >
                                Remove Vehicle
                            </Button>
                        )}
                    </div>
                ))}
                {isEditing && (
                    <Button
                        onClick={addVehicle}
                        className="hover:underline cursor-pointer"
                        type="button"
                    >
                        <FaPlusCircle className="h-6 w-6 mr-2" />
                        Add New Vehicle
                    </Button>
                )}
            </div>
        );
    };

    // Validation on save
    const validateRequiredFields = () => {
        const errors = [];
        if (!data.claim_id) errors.push("Claim Reference Number");
        if (!data.full_name) errors.push("Patient name");
        if (!data.accident_date) errors.push("Date of accident");
        if (!data.accident_country) errors.push("Country of Accident");
        if (!data.accident_state) errors.push("State/City of Accident");

        // if (!data.accident_country) errors.push("Country of accident");
        // if (!data.accident_state) errors.push("State of accident");
        if (errors.length > 0) {
            toast({
                title: "Missing Required Fields",
                description: `Please fill in: ${errors.join(", ")}`,
                variant: "default",
            });
            return false;
        }
        return true;
    };

    const handleSaveClick = async () => {
        if (!validateRequiredFields()) return;
        setIsSaving(true);
        await handleSave(claim.claim_id);
        setIsSaving(false);
    };

    return (
        <div className={cn("min-h-screen flex w-full flex-col items-center justify-start pt-12")}>
            {/* Edit/Save/Cancel Buttons outside the form */}
            <div className="w-full max-w-5xl flex justify-end items-center mb-8">
                {isEditing ? (
                    <div className="flex items-center gap-4">
                        <Button
                            variant="default"
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600 min-w-32"
                        >
                            {isSaving ? <LoaderCircle className="animate-spin h-5 w-5" /> : "Save Changes"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleCancel(claim.claim_id)}
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 rounded-md transition hover:bg-gray-500"
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="default"
                        onClick={() => onEdit(claim.claim_id)}
                        className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600 min-w-32"
                    >
                        Edit Claim
                    </Button>
                )}
            </div>

            <div className={cn("w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 xl:p-16 overflow-y-auto", pdf)}>
                {/* Header */}
                <div className="mb-4 flex flex-col-reverse items-center justify-start w-full gap-8 text-start lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                        <FaFileUpload />
                        Accident Claim Report
                    </h1>
                    <Image
                        src="/assets/vws-hor.png"
                        alt="Publicuy Logo"
                        className="h-auto object-contain m-auto lg:m-0"
                        width={300}
                        height={50}
                    />
                </div>
                <p className="text-gray-600 dark:text-gray-400 my-4 mb-6 text-center lg:text-left">
                    This form displays all details related to the claim assistance.
                </p>

                {/* Patient Personal Information */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaUser />
                        Patient Personal Information
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, you must complete with all of your policyholder personal information.
                    </p>
                    {isEditing ? (
                        <>
                            <div className="mb-4">
                                <Label>Claim Reference Number <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Enter claim reference number"
                                    value={data.claim_id || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "claim_id", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Full Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Enter patient full name"
                                        value={data.full_name || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "full_name", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="Enter email"
                                        value={data.email || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "email", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Country of residence</Label>
                                    {/* <select
                                        value={data.country || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "country", e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="">Select country</option>
                                        {countryOptions.map((country) => (
                                            <option key={country.value} value={country.value}>{country.label}</option>
                                        ))}
                                    </select> */}
                                    <Select value={data.country || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "country", val)}>
                                        <SelectTrigger className="w-full capitalize">
                                            <SelectValue className="">{data.country || ""}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {countryOptions.map((country) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={country.value} value={country.value}>{country.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>State</Label>
                                    {isUSA ? (
                                        <Select value={data.state || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "state", val)}>
                                            <SelectTrigger className="w-full capitalize">
                                                <SelectValue className="">{data.state || ""}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[320px] overflow-y-auto">
                                                {usaStates.map((st) => (
                                                    <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={st.value} value={st.value}>{st.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    ) : (
                                        <Input
                                            placeholder="Enter state"
                                            value={data.state || ""}
                                            onChange={(e) => handleFieldChange(claim.claim_id, "state", e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Primary Contact Phone Number</Label>
                                    <CustomPhoneInput
                                        value={data.primary_contact || ""}
                                        onChange={(val) => handleFieldChange(claim.claim_id, "primary_contact", val)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {renderViewField("Claim Reference Number", data.claim_id)}
                            {renderViewField("Full Name", data.full_name)}
                            {renderViewField("Email", data.email, "N/A")}
                            {renderViewField("Country of residence", data.country, "N/A")}
                            {renderViewField("State", data.state, "N/A")}
                            {renderViewField("Primary Contact Phone Number", data.primary_contact, "N/A")}
                        </>
                    )}
                </section>

                {/* Other Contact */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaPhone />
                        Other Contact
                    </h2>
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Relative or Friend</Label>
                                <Input
                                    placeholder="Name of other contact"
                                    value={data.other_contact_name || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "other_contact_name", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Other Contact Phone Number</Label>
                                <CustomPhoneInput
                                    value={data.other_contact_phone || ""}
                                    onChange={(val) => handleFieldChange(claim.claim_id, "other_contact_phone", val)}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderViewField("Relative or Friend", data.other_contact_name, "N/A")}
                            {renderViewField("Other Contact Phone Number", data.other_contact_phone, "N/A")}
                        </>
                    )}
                </section>

                {/* Accident Information */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaMapMarkerAlt />
                        Accident Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, complete with the most important accident details and select the type of accident that will guide you through specific requirements for that incident.
                    </p>
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                            <div className="">
                                <Label>Type of Accident</Label>
                                {/* <select
                                    value={data.accident_type || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "accident_type", e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Choose an option...</option>
                                    {accidentTypeOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select> */}
                                <Select value={data.accident_type || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "accident_type", val)}>
                                    <SelectTrigger className="w-full capitalize">
                                        <SelectValue className="">{data.accident_type || ""}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {accidentTypeOptions.map((opt) => (
                                            <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Date of Accident <span className="text-red-500">*</span></Label>
                                <DatePicker
                                    selectedDate={data.accident_date ? new Date(data.accident_date) : null}
                                    onChange={(date) =>
                                        handleFieldChange(claim.claim_id, "accident_date", date ? date.toISOString() : "")
                                    }
                                />
                            </div>
                            <div>
                                <Label>Country of Accident <span className="text-red-500">*</span></Label>
                                {/* <select
                                    value={data.accident_country || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "accident_country", e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select country</option>
                                    {countryOptions.map((country) => (
                                        <option key={country.value} value={country.value}>{country.label}</option>
                                    ))}
                                </select> */}
                                <Select
                                    value={data.accident_country || ""}
                                    onValueChange={(val) => handleFieldChange(claim.claim_id, "accident_country", val)}
                                >
                                    <SelectTrigger className="w-full capitalize">
                                        <SelectValue className="">
                                            {data.accident_country
                                                ? data.accident_country
                                                    .split("_")
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                    .join(" ")
                                                : "Select Country of Accident"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {countryOptions.map((country) => (
                                            <SelectItem
                                                className="hover:bg-slate-100 cursor-pointer text-sm px-2"
                                                key={country.value}
                                                value={country.value}
                                            >
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </div>
                            <div>
                                <Label>State or City of Accident <span className="text-red-500">*</span></Label>
                                {isUSAbis ? (
                                    <Select value={data.accident_state || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "accident_state", val)}>
                                        <SelectTrigger className="w-full capitalize">
                                            <SelectValue className="">{data.accident_state || "City or State of the Accident"}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {usaStates.map((st) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={st.label} value={st.value}>{st.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        placeholder="Enter state"
                                        value={data.accident_state || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "accident_state", e.target.value)}
                                    />
                                )}
                                <span className="text-xs text-gray-500 italic dark:text-gray-400">
                                    If you don&apos;t know the state or city add &quot;N/A&quot;
                                </span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderViewField("Type of Accident", selectedAccidentType?.label, "N/A")}
                            {renderViewField("Date of Accident", data.accident_date ? new Date(data.accident_date).toLocaleDateString() : "", "N/A")}
                            {renderViewField("Country of Accident", data.accident_country, "N/A")}
                            {renderViewField("State of Accident", data.accident_state, "N/A")}
                        </>
                    )}
                </section>

                {/* Conditional sections based on Accident Type */}
                {data.accident_type === "motor_vehicle_accidents" && (
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaCar />
                            Motor Vehicle Accident Details
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, provide all vehicle details such as automobile descriptions and insurance certificates.
                        </p>
                        {isEditing ? (
                            <>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <Label>Motor Vehicle Accident Type</Label>
                                        {/* <select
                                            value={data.mva_type || ""}
                                            onChange={(e) => handleFieldChange(claim.claim_id, "mva_type", e.target.value)}
                                            className="border rounded p-2 w-full"
                                        >
                                            <option value="">Select MVA Type</option>
                                            {accidentTypeOptions
                                                .find(opt => opt.value === "motor_vehicle_accidents")
                                                ?.subOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                        </select> */}
                                        <Select value={data.mva_type || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "mva_type", val)}>
                                            <SelectTrigger className="w-full capitalize">
                                                <SelectValue className="">{data.mva_type || ""}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[320px] overflow-y-auto">
                                                {accidentTypeOptions
                                                    .find(opt => opt.value === "motor_vehicle_accidents")
                                                    ?.subOptions.map((o) => (
                                                        <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={o.value} value={o.value}>{o.label}</SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Where were you located at the time of the accident?</Label>
                                        {/* <select
                                            value={data.mva_location || ""}
                                            onChange={(e) => handleFieldChange(claim.claim_id, "mva_location", e.target.value)}
                                            className="border rounded p-2 w-full"
                                        >
                                            <option value="">Select an option...</option>
                                            <option value="passenger">Passenger</option>
                                            <option value="driver">Driver</option>
                                            <option value="pedestrian">Pedestrian</option>
                                            <option value="bicycle">Bicycle</option>
                                        </select> */}
                                        <Select value={data.mva_location || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "mva_location", val)}>
                                            <SelectTrigger className="w-full capitalize">
                                                <SelectValue className="">{data.mva_location || ""}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[320px] overflow-y-auto">
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" value="passenger">Passenger</SelectItem>
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" value="driver">Driver</SelectItem>
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" value="pedestrian">Pedestrian</SelectItem>
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" value="bicycle">Bicycle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <FaCarSide />
                                        Motor Vehicle Information
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-400">
                                        In this section, provide the available information for each vehicle involved in the accident.
                                    </p>
                                    {renderVehicleSection()}
                                </div>

                                <div className="mt-8">
                                    <Label>Please select the vehicle that you were in at the time of the accident.</Label>
                                    {/* <select
                                        value={data.selected_vehicle || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "selected_vehicle", e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="">Select a vehicle</option>
                                        {vehicleDetails.map((v, i) => (
                                            <option key={i} value={String(i)}>
                                                Vehicle #{i + 1}: {v.model || "Unnamed Vehicle"}
                                            </option>
                                        ))}
                                    </select> */}
                                    <Select value={data.selected_vehicle || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "selected_vehicle", val)}>
                                        <SelectTrigger className="w-full capitalize">
                                            <SelectValue className="">{data.selected_vehicle || ""}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {vehicleDetails.map((v, i) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={i} value={String(i)}>
                                                    Vehicle #{i + 1}: {v.model || "Unnamed Vehicle"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="mt-8">
                                    <Label>Please write a brief description of the accident.</Label>
                                    <Textarea
                                        value={data.mva_description || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "mva_description", e.target.value)}
                                        rows={5}
                                        placeholder="Describe the accident..."
                                    />
                                </div>

                                <div className="mt-6">
                                    <Label>Upload Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) => {
                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                        }
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {renderViewField("Motor Vehicle Accident Type", data.mva_type, "N/A")}
                                {renderViewField("Your location at the time of the accident", data.mva_location, "N/A")}
                                <h3 className="text-xl font-semibold mb-4 mt-8 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaCarSide />
                                    Motor Vehicle Information
                                </h3>
                                {renderVehicleSection()}
                                <div className="my-4" />
                                {renderViewField("Selected Vehicle", data.selected_vehicle !== undefined && data.selected_vehicle !== null
                                    ? `Vehicle #${Number(data.selected_vehicle) + 1}`
                                    : "N/A")}
                                {renderViewText("Description of the Accident", data.mva_description, "N/A")}
                            </>
                        )}
                    </section>
                )}

                {data.accident_type === "slip_and_fall" && (
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaWalking />
                            Slip and Fall Accident Details
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, provide all the details regarding the slip and fall accident.
                        </p>
                        {isEditing ? (
                            <>
                                <div>
                                    <Label>Slip Description</Label>
                                    <Textarea
                                        value={data.slip_description || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "slip_description", e.target.value)}
                                        placeholder="Describe the accident..."
                                        rows={5}
                                    />
                                </div>
                                <div className="mt-4">
                                    <Label>Slip Accident Type</Label>
                                    {/* <select
                                        value={data.slip_accident_type || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "slip_accident_type", e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="">Select an option...</option>
                                        {accidentTypeOptions
                                            .find((opt) => opt.value === "slip_and_fall")
                                            ?.subOptions.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                    </select> */}
                                    <Select value={data.slip_accident_type || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "slip_accident_type", val)}>
                                        <SelectTrigger className="w-full capitalize">
                                            <SelectValue className="">{data.slip_accident_type || ""}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {accidentTypeOptions
                                                .find((opt) => opt.value === "slip_and_fall")
                                                ?.subOptions.map((o) => (
                                                    <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                                <div className="mt-4">
                                    <Label>Negligence Description</Label>
                                    <Textarea
                                        value={data.negligence_description || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "negligence_description", e.target.value)}
                                        placeholder="Explain..."
                                        rows={5}
                                    />
                                </div>
                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <FaUser />
                                        Witness Information
                                    </h3>
                                    <div className="flex flex-col w-full gap-6">
                                        <div className="flex w-full justify-between items-end gap-6">
                                            <div className="w-full">
                                                <Label>Full Name</Label>
                                                <Input
                                                    placeholder="Enter witness's full name"
                                                    value={data.witness_name || ""}
                                                    onChange={(e) => handleFieldChange(claim.claim_id, "witness_name", e.target.value)}
                                                />
                                            </div>
                                            <div className="w-full mt-3">
                                                <Label>Phone</Label>
                                                <CustomPhoneInput
                                                    value={data.witness_phone || ""}
                                                    onChange={(val) => handleFieldChange(claim.claim_id, "witness_phone", val)}
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="Enter witness's email"
                                                value={data.witness_email || ""}
                                                onChange={(e) => handleFieldChange(claim.claim_id, "witness_email", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <Label>Upload Slip & Fall Documents</Label>
                                        <FileUpload
                                            multiple
                                            onFilesSelected={(files) => {
                                                handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                            }
                                            }
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {renderViewText("Slip Description", data.slip_description, "N/A")}
                                {renderViewField("Slip Accident Type", data.slip_accident_type, "N/A")}
                                {renderViewText("Negligence Description", data.negligence_description, "N/A")}
                                <h3 className="text-xl font-semibold mb-4 mt-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaUser />
                                    Witness Information
                                </h3>
                                {renderViewField("Witness Full Name", data.witness_name, "N/A")}
                                {renderViewField("Witness Phone", data.witness_phone, "N/A")}
                                {renderViewField("Witness Email", data.witness_email, "N/A")}
                            </>
                        )}
                    </section>
                )}

                {/* Medical Information */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaHeartbeat />
                        Medical Information
                    </h2>
                    {/* <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, complete with the most important accident details and select the type of accident that will guide you through specific requirements for that incident.
                    </p> */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, complete with all ongoing medical treatments, or future medical needs.
                    </p>
                    <div className="my-4" />
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Type of Assistance</Label>
                                {/* <select
                                    value={data.medical_assistance_type || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "medical_assistance_type", e.target.value)}
                                    className="border rounded p-2 w-full"
                                >
                                    <option value="">Select type of assistance</option>
                                    {["Medical Treatment", "Hospitalization", "Surgery", "Physical Therapy", "Psychological Therapy", "Other"].map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select> */}
                                <Select value={data.medical_assistance_type || ""} onValueChange={(val) => handleFieldChange(claim.claim_id, "medical_assistance_type", val)}>
                                    <SelectTrigger className="w-full capitalize">
                                        <SelectValue className="">{data.medical_assistance_type || ""}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {["Medical Treatment", "Hospitalization", "Surgery", "Physical Therapy", "Psychological Therapy", "Other"].map((o) => (
                                            <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={o} value={o}>{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Diagnosis</Label>
                                <Textarea
                                    placeholder="Provide details of the diagnosis..."
                                    rows={4}
                                    value={data.medical_diagnosis || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "medical_diagnosis", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Treatment</Label>
                                <Textarea
                                    placeholder="Describe the treatment provided..."
                                    rows={4}
                                    value={data.medical_treatment || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "medical_treatment", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2 mb-3">
                                <Label>Primary Care Provider</Label>
                                <Input
                                    placeholder="Name of the clinic or hospital"
                                    value={data.primary_care_provider || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "primary_care_provider", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Upload Documents</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) => {
                                        handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                    }
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderViewField("Type of Assistance", data.medical_assistance_type, "N/A")}
                            {renderViewText("Diagnosis", data.medical_diagnosis, "N/A")}
                            {renderViewText("Treatment", data.medical_treatment, "N/A")}
                            {renderViewField("Primary Care Provider", data.primary_care_provider, "N/A")}
                        </>
                    )}
                </section>

                {/* Cost of Assistance */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaDollarSign />
                        Cost of Assistance
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Fill in all costs received related to the claim, even if they are estimated or exceed the policy limit. <br />Cost are submittied in the standard USD$ currency<i>(e.g. $1,000.00)</i>.
                    </p>

                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="relative">
                                <Label>Estimated Total Cost</Label>
                                <div className="flex items-center gap-2">
                                    {/* <select
                                        value={data.total_cost_currency || "USD"}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "total_cost_currency", e.target.value)}
                                        className="border rounded p-2 w-24"
                                    >
                                        {currencyOptions.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select> */}
                                    <Select value={data.total_cost_currency || "USD"} onValueChange={(val) => handleFieldChange(claim.claim_id, "total_cost_currency", val)}>
                                        <SelectTrigger className="w-24">
                                            <SelectValue className="">{data.total_cost_currency || "USD"}</SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {currencyOptions.map((c) => (
                                                <SelectItem className="hover:bg-slate-100 cursor-pointer text-sm px-2" key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <Input
                                        name="medical_total_cost"
                                        placeholder="Enter total cost"
                                        value={data.medical_total_cost || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "medical_total_cost", e.target.value)}
                                        className="flex-grow"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderViewField("Estimated Total Cost", data.medical_total_cost ? `${data.medical_total_cost} ${data.total_cost_currency}` : "0")
                    )}

                    <Separator className="md:col-span-2" />

                    {renderCostSection("medical_provider_costs", "Medical Provider Bills", <Hospital className="mr-2 h-5 w-5" />)}
                    {renderCostSection("repatriation_costs", "Repatriation Bills", <PlaneTakeoff className="mr-2 h-5 w-5" />)}
                    {renderCostSection("other_costs", "Other Bills", <Ellipsis className="mr-2 h-5 w-5" />)}

                    <Separator className="md:col-span-2" />

                    {isEditing && (
                        <div className="md:col-span-2 mt-6">
                            <Label>Upload documentation:</Label>
                            <FileUpload
                                multiple
                                onFilesSelected={(files) => {
                                    handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                }
                                }
                            />
                        </div>
                    )}
                </section>

                {/* Third Party Information */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaUsers />
                        Third Party Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, completed with all details from any other individual, company, or owner involved, such as an insurance, establishment owner, assistance company or other company on file.
                    </p>
                    {/* Insurance Company */}
                    <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaBuilding />
                            Insurance Company
                        </h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Insurance Company</Label>
                                    <Input
                                        placeholder="Enter insurance company name"
                                        value={data.insurance_company || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "insurance_company", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Claim Reference Number</Label>
                                    <Input
                                        placeholder="Enter claim reference number"
                                        value={data.claim_reference_number || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "claim_reference_number", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Adjuster Name</Label>
                                    <Input
                                        placeholder="Enter adjuster's name"
                                        value={data.adjuster_name || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "adjuster_name", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Adjuster Contact Details</Label>
                                    <Textarea
                                        placeholder="Email or phone number"
                                        rows={3}
                                        value={data.adjuster_contact_details || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "adjuster_contact_details", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Insurance Company Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) => {
                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                        }
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {renderViewField("Insurance Company", data.insurance_company, "N/A")}
                                {renderViewField("Claim Reference Number", data.claim_reference_number, "N/A")}
                                {renderViewField("Adjuster Name", data.adjuster_name, "N/A")}
                                {renderViewText("Adjuster Contact Details", data.adjuster_contact_details, "N/A")}
                            </>
                        )}
                    </div>

                    {/* Owner Business */}
                    <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaBuilding />
                            Owner Business Involved (if commercial)
                        </h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Business Name</Label>
                                    <Input
                                        placeholder="Enter owner or company name"
                                        value={data.owner_business_name || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "owner_business_name", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Internal Report Number</Label>
                                    <Input
                                        placeholder="Enter internal report number"
                                        value={data.owner_reference_number || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "owner_reference_number", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <CustomPhoneInput
                                        value={data.owner_phone_number || ""}
                                        onChange={(val) => handleFieldChange(claim.claim_id, "owner_phone_number", val)}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Business Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) => {
                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                        }
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {renderViewField("Business Name", data.owner_business_name, "N/A")}
                                {renderViewField("Reference Number", data.owner_reference_number, "N/A")}
                                {renderViewField("Phone Number", data.owner_phone_number, "N/A")}
                            </>
                        )}
                    </div>

                    {/* Co-Insurer */}
                    <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUserFriends />
                            Co-Insurer (if any)
                        </h3>
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Co-Insurer</Label>
                                    <Input
                                        placeholder="Other Insurance Name"
                                        value={data.co_insured_name || ""}
                                        onChange={(e) => handleFieldChange(claim.claim_id, "co_insured_name", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Upload File</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) => {
                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                        }
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            renderViewField("Co-Insurer", data.co_insured_name, "N/A")
                        )}
                    </div>

                    {/* Other Party */}
                    <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUserTie />
                            Other Party Involved in the Accident
                        </h3>
                        {isEditing ? (
                            <Textarea
                                placeholder="Any other third party details..."
                                rows={4}
                                value={data.other_party_info || ""}
                                onChange={(e) => handleFieldChange(claim.claim_id, "other_party_info", e.target.value)}
                            />
                        ) : (
                            renderViewText("Other Party Info", data.other_party_info, "N/A")
                        )}
                    </div>
                </section>

                {/* Personal Attorney */}
                <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        <FaUserTie />
                        Personal Attorney
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        In this section, request and complete with any possible legal representation the policyholder may have regarding the accident.
                    </p>
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Law Firm Name</Label>
                                <Input
                                    placeholder="Enter law firm name"
                                    value={data.law_firm_name || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "law_firm_name", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Attorney Name</Label>
                                <Input
                                    placeholder="Enter attorney name"
                                    value={data.attorney_name || ""}
                                    onChange={(e) => handleFieldChange(claim.claim_id, "attorney_name", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Attorney Phone</Label>
                                <CustomPhoneInput
                                    value={data.attorney_phone || ""}
                                    onChange={(val) => handleFieldChange(claim.claim_id, "attorney_phone", val)}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Upload All Documents Regarding the Law Firm:</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) => {
                                        handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                    }
                                    }
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderViewField("Law Firm Name", data.law_firm_name, "N/A")}
                            {renderViewField("Attorney Name", data.attorney_name, "N/A")}
                            {renderViewField("Attorney Phone", data.attorney_phone, "N/A")}
                        </>
                    )}
                </section>

                {/* Display all existing files at the end if not editing */}
                {!isEditing && (
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaFileUpload />
                            All Uploaded Documentation
                        </h2>
                        {renderExistingFiles(existingFiles)}
                    </section>
                )}

            </div>
        </div>
    );
}

// components/ClaimDetails.tsx

"use client";

import React, { useState, useEffect } from "react";
import { formSections } from "./config/form-config";
import { FaCarSide, FaFileAlt, FaFilePdf, FaUser, FaEdit, FaPlusCircle, FaTrash, FaBuilding, FaUserFriends, FaUserTie, FaMapMarkerAlt, FaHeartbeat, FaDollarSign, FaWalking, FaFileUpload, } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import DatePicker from "@/components/ui/date-picker";
import { AccidentClaimFormData, EditableClaim, VehicleDetail, CostDetail } from "./config/types";
import { RiAlarmWarningFill } from "react-icons/ri";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define the accident icons
export const accidentIcons = {
    motor_vehicle_accidents: <FaCarSide />,
    aviation_accidents: <RiAlarmWarningFill />,
    slip_and_fall: <FaWalking />, // Example for another type
    premises_liability: <RiAlarmWarningFill />,
    dog_bites_or_animal_attacks: <FaUser />, // Example for another type
    wrongful_death: <RiAlarmWarningFill />,
    public_transportation_accidents: <FaCarSide />,
    recreational_accidents: <RiAlarmWarningFill />,
};

interface ClaimDetailsProps {
    claim: EditableClaim;
    onEdit: (claim_id: string) => void;
    handleSave: (claim_id: string) => void;
    handleCancel: (claim_id: string) => void;
    handleFieldChange: (claim_id: string, fieldPath: string, value: any) => void;
}

export function getNestedValue(obj: any, pathStr: string): any {
    const path = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.');
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

const formatLabel = (field: string) => {
    return field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/Mva/g, "MVA");
};

const ClaimDetails: React.FC<ClaimDetailsProps> = ({
    claim,
    onEdit,
    handleSave,
    handleCancel,
    handleFieldChange,
}) => {
    const { isEditing, editedData } = claim;
    const router = useRouter();

    const accidentType = (isEditing ? editedData.accident_type : claim.accident_type) as keyof typeof accidentIcons;

    const renderAccidentTypeSection = () => {
        if (!accidentType) {
            return (
                <p className="text-gray-500 dark:text-gray-400">
                    No accident type selected.
                </p>
            );
        }

        const icon = accidentIcons[accidentType] || <RiAlarmWarningFill />;
        return (
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    {icon}
                    Accident Type: {accidentType.replace(/_/g, " ").toUpperCase()}
                </h2>
                {formSections
                    .find((section) => section.title === "Accident Information")
                    ?.fields.filter((field) => field.id === "accident_type")
                    .map((field) => {
                        const value = isEditing
                            ? editedData[field.id as keyof typeof editedData]
                            : claim[field.id as keyof EditableClaim] || "N/A";

                        return (
                            <div key={field.id} className="flex flex-col">
                                <Label className="mb-1">{formatLabel(field.label)}</Label>

                                {isEditing ? (
                                    <Select
                                        onValueChange={(value) =>
                                            handleFieldChange(claim.claim_id, field.id, value)
                                        }
                                        value={editedData[field.id as keyof AccidentClaimFormData] as string}
                                        required={field.required}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {accidentType.replace(/_/g, " ").toUpperCase() || "N/A"}
                                    </span>
                                )}
                            </div>
                        );
                    })}
            </section>
        );
    };

    const renderExistingFiles = (files?: string[] | null) => {
        const validFiles = Array.isArray(files) ? files : [];

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
                            {/* File Icon or Thumbnail */}
                            <div className="w-8 h-8 flex items-center justify-center">
                                {fileUrl.endsWith(".pdf") ? (
                                    <FaFilePdf className="text-red-500" />
                                ) : fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={fileUrl}
                                        alt="File Thumbnail"
                                        className="w-8 h-8 object-cover rounded"
                                    />
                                ) : (
                                    <FaFileAlt className="text-gray-500" />
                                )}
                            </div>

                            {/* File Name with Link */}
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate"
                            >
                                {fileName}
                            </a>

                            {/* Download Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(fileUrl);
                                        if (!response.ok) {
                                            throw new Error("Failed to fetch file");
                                        }
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement("a");
                                        link.href = blobUrl;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl); // Clean up
                                    } catch (error) {
                                        console.error("Download failed:", error);
                                        toast({ title: "Error", description: "Failed to download file.", variant: "destructive" });
                                    }
                                }}
                                className="text-gray-500 dark:text-gray-300"
                            >
                                Download
                            </Button>
                        </div>
                    );
                })}
            </div>
        );
    };

    // **New**: Render Vehicle Details as a Table in View Mode
    const renderVehicleDetailsTable = (vehicleDetails: VehicleDetail[]) => {
        if (!Array.isArray(vehicleDetails) || vehicleDetails.length === 0) {
            return (
                <div className="text-center py-4 border rounded-md bg-gray-100 dark:bg-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                        No vehicle details provided
                    </span>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">#</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Insurance Name</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">License Number</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Model</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Policy Number</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicleDetails.map((vehicle, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{index + 1}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{vehicle.insuranceName || "N/A"}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{vehicle.licenseNumber || "N/A"}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{vehicle.model || "N/A"}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{vehicle.policyNumber || "N/A"}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{vehicle.year || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // **New**: Render Editable Vehicle Details as a Table in Edit Mode
    const renderEditableVehicleDetailsTable = (vehicleDetails: VehicleDetail[]) => {
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

        const handleVehicleChange = (index: number, field: keyof VehicleDetail, value: string) => {
            const updatedVehicles = [...vehicleDetails];
            updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
            handleFieldChange(claim.claim_id, `vehicle_details`, updatedVehicles);
        };

        const removeVehicle = (index: number) => {
            if (vehicleDetails.length === 1) {
                toast({ title: "Error", description: "At least one vehicle must be present.", variant: "destructive" });
                return;
            }
            const updatedVehicles = vehicleDetails.filter((_, i) => i !== index);
            handleFieldChange(claim.claim_id, `vehicle_details`, updatedVehicles);
        };

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">#</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Insurance Name</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">License Number</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Model</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Policy Number</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Year</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicleDetails.map((vehicle, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">{index + 1}</td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Input
                                        type="text"
                                        value={vehicle.insuranceName}
                                        onChange={(e) => handleVehicleChange(index, 'insuranceName', e.target.value)}
                                        className="w-full"
                                        placeholder="Insurance Name"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Input
                                        type="text"
                                        value={vehicle.licenseNumber}
                                        onChange={(e) => handleVehicleChange(index, 'licenseNumber', e.target.value)}
                                        className="w-full"
                                        placeholder="License Number"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Input
                                        type="text"
                                        value={vehicle.model}
                                        onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                                        className="w-full"
                                        placeholder="Model"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Input
                                        type="text"
                                        value={vehicle.policyNumber}
                                        onChange={(e) => handleVehicleChange(index, 'policyNumber', e.target.value)}
                                        className="w-full"
                                        placeholder="Policy Number"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Input
                                        type="text"
                                        value={vehicle.year}
                                        onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                                        className="w-full"
                                        placeholder="Year"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b text-sm text-gray-700 dark:text-gray-300">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeVehicle(index)}
                                        className="mr-2"
                                    >
                                        <FaTrash className="mr-1 h-4 w-4" />
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Button onClick={addVehicle} variant="default" className="mt-4 flex items-center">
                    <FaPlusCircle className="mr-2 h-5 w-5" />
                    Add Vehicle
                </Button>
            </div>
        );
    };

    // Access parsed file_uploads and vehicle_details from editedData or claim
    const existingFiles = isEditing
        ? Array.isArray(editedData.file_uploads) ? editedData.file_uploads : []
        : Array.isArray(claim.file_uploads) ? claim.file_uploads : [];

    const vehicleDetails = isEditing
        ? Array.isArray(editedData.vehicle_details) ? editedData.vehicle_details : []
        : Array.isArray(claim.vehicle_details) ? claim.vehicle_details : [];

    return (
        <div className="w-full flex-col">
            <div className="flex justify-end items-center mb-8">
                <div className="flex space-x-4">
                    {isEditing ? (
                        <>
                            <Button
                                variant="default"
                                onClick={() => handleSave(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600"
                            >
                                Save
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleCancel(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition hover:bg-gray-500"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => onEdit(claim.claim_id)}
                            className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600"
                        >
                            <FaEdit className="mr-2" />
                            Edit Claim
                        </Button>
                    )}
                </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                {/* Header with Edit/Save/Cancel Buttons */}
                <div className="mb-8 flex flex-row items-center justify-between w-full gap-16 text-start">

                    <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                        <FaFileUpload />
                        Accident Claim Report
                    </h1>
                    <Image
                        src="/assets/vws-hor.png"
                        alt="Publicuy Logo"
                        className="h-auto object-contain ml-auto"
                        width={300}
                        height={50}
                    />

                </div>
                <p className="text-gray-600 dark:text-gray-400 my-4 mb-6 text- text-justify">
                    This form is intended to be completed with all the details related to the claim assistance. Use it as a guide to provide all the available data in your file or collect the necessary details from the policyholder. You may not have all the information when uploading the claim for the first time, but you can always access your personal dashboard, to edit and add pending information as soon as you receive it.
                </p>


                {/* Iterate over formSections to display data */}
                {formSections.map((section) => (
                    <section key={section.title} className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            {section.icon}
                            {section.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.fields.map((field) => {
                                // **IMPORTANT**: Ensure that 'file_uploads' field has been removed from formSections in form-config.ts
                                if (field.id === "file_uploads") {
                                    return null; // Skip rendering the 'file_uploads' field to prevent duplication
                                }

                                let value = getNestedValue(isEditing ? editedData : claim, field.id);

                                const renderValue = () => {

                                    if (field.type === "file") {
                                        if (isEditing) {
                                            return (
                                                <div className="space-y-4 w-full">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Existing Files
                                                        </h4>
                                                        {renderExistingFiles(existingFiles)}
                                                    </div>
                                                    <FileUpload
                                                        multiple
                                                        onFilesSelected={(files) =>
                                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="space-y-2 w-full">
                                                    {renderExistingFiles(existingFiles)}
                                                </div>
                                            );
                                        }
                                    }

                                    if (field.type === "select") {
                                        if (isEditing) {
                                            return (
                                                <Select
                                                    onValueChange={(value) =>
                                                        handleFieldChange(claim.claim_id, field.id, value)
                                                    }
                                                    value={editedData[field.id as keyof AccidentClaimFormData] as string}
                                                    required={field.required}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        } else {
                                            const selectedOption = field.options?.find((opt) => opt.value === value);
                                            return <span className="text-gray-700 dark:text-gray-300">{selectedOption?.label || "N/A"}</span>;
                                        }
                                    }

                                    if (field.type === "textarea" || field.type === "text") {
                                        if (isEditing) {
                                            return (
                                                <Textarea
                                                    value={typeof value === "string" ? value : ""}
                                                    onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                    className="w-full"
                                                    required={field.required}
                                                />
                                            );
                                        } else {
                                            if (typeof value === "string") {
                                                return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                            } else if (typeof value === "object" && value !== null) {
                                                return (
                                                    <ul className="list-disc list-inside">
                                                        {Object.entries(value).map(([key, val], index) => (
                                                            <li key={index} className="text-gray-700 dark:text-gray-300">
                                                                {key}: {JSON.stringify(val)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                );
                                            }
                                            return <span className="text-gray-700 dark:text-gray-300">N/A</span>;
                                        }
                                    }

                                    // Handle generic objects
                                    if (typeof value === "object" && value !== null) {
                                        return (
                                            <ul className="list-disc list-inside">
                                                {Object.entries(value).map(([key, val], index) => (
                                                    <li key={index} className="text-gray-700 dark:text-gray-300">
                                                        {key}: {JSON.stringify(val)}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }

                                    if (field.type === "date") {
                                        if (isEditing) {
                                            const dateValue = typeof value === "string" ? value.split("T")[0] : "";
                                            return (
                                                <DatePicker
                                                    selectedDate={dateValue ? new Date(dateValue) : null}
                                                    onChange={(date: Date | null) => {
                                                        if (date) {
                                                            const formattedDate = date.toISOString();
                                                            handleFieldChange(claim.claim_id, field.id, formattedDate);
                                                        } else {
                                                            handleFieldChange(claim.claim_id, field.id, "");
                                                        }
                                                    }}
                                                />
                                            );
                                        } else {
                                            const date = new Date(value as string);
                                            if (isNaN(date.getTime())) {
                                                return <span className="text-gray-700 dark:text-gray-300">Invalid Date</span>;
                                            }
                                            return <span className="text-gray-700 dark:text-gray-300">{date.toLocaleDateString()}</span>;
                                        }
                                    }

                                    if (field.type === "number") {
                                        if (isEditing) {
                                            return (
                                                <Input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                    className="w-full"
                                                    required={field.required}
                                                />
                                            );
                                        } else {
                                            return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                        }
                                    }

                                    if (field.type === "text" || field.type === "email") {
                                        if (isEditing) {
                                            return (
                                                <Input
                                                    type={field.type}
                                                    value={value}
                                                    onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                    className="w-full"
                                                    required={field.required}
                                                />
                                            );
                                        } else {
                                            return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                        }
                                    }

                                    if (field.type === "vehicleDetails") {
                                        return isEditing
                                            ? renderEditableVehicleDetailsTable(vehicleDetails)
                                            : renderVehicleDetailsTable(vehicleDetails);
                                    }

                                    if (Array.isArray(value)) {
                                        return (
                                            <ul className="list-disc list-inside">
                                                {value.map((item, index) => (
                                                    <li key={index} className="text-gray-700 dark:text-gray-300">{JSON.stringify(item)}</li>
                                                ))}
                                            </ul>
                                        );
                                    }

                                    return <span className="text-gray-700 dark:text-gray-300">{value !== null && value !== undefined ? value.toString() : "N/A"}</span>;
                                };

                                return (
                                    <div key={field.id} className="flex flex-col">
                                        <Label className="mb-1">{formatLabel(field.label)}</Label>
                                        {renderValue()}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {/* Footer with Save/Cancel Buttons */}
                <div className="flex space-x-4">
                    {isEditing ? (
                        <>
                            <Button
                                variant="default"
                                onClick={() => handleSave(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600"
                            >
                                Save
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleCancel(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition hover:bg-gray-500"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => onEdit(claim.claim_id)}
                            className="flex items-center px-4 py-2 rounded-md transition hover:bg-blue-600"
                        >
                            Edit Claim
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

};

export default ClaimDetails;

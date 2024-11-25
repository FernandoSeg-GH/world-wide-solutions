// components/ClaimDetails.tsx

import React from "react";
import { formSections } from "./config/form-config";
import { FaCarSide, FaFileAlt, FaFilePdf, FaTrash, FaUser } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import DatePicker from "@/components/ui/date-picker";
import { EditableClaim } from "./config/types";
import { RiAlarmWarningFill } from "react-icons/ri";

interface ClaimDetailsProps {
    claim: EditableClaim;
    onEdit: (claim_id: string) => void;
    handleSave: (claim_id: string) => void;
    handleCancel: (claim_id: string) => void;
    handleFieldChange: (claim_id: string, fieldPath: string, value: any) => void;
}

export function getNestedValue(obj: any, path: string[]): any {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

const formatLabel = (field: string) => {
    return field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/Mva/g, "MVA");
};

export const accidentIcons = {
    motor_vehicle_accidents: <FaCarSide />,
    aviation_accidents: <RiAlarmWarningFill />,
    slip_and_fall: <FaUser />, // Example for another type
    premises_liability: <RiAlarmWarningFill />,
    dog_bites_or_animal_attacks: <FaUser />, // Example for another type
    wrongful_death: <RiAlarmWarningFill />,
    public_transportation_accidents: <FaCarSide />,
    recreational_accidents: <RiAlarmWarningFill />,
};


const ClaimDetails: React.FC<ClaimDetailsProps> = ({
    claim,
    onEdit,
    handleSave,
    handleCancel,
    handleFieldChange,
}) => {
    const { isEditing, editedData } = claim;

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
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {formatLabel(field.label)}
                                </label>
                                {isEditing ? (
                                    <select
                                        value={typeof value === 'string' || typeof value === 'number' || (Array.isArray(value) && value.every(item => typeof item === 'string')) ? value : ""}
                                        onChange={(e) =>
                                            handleFieldChange(claim.claim_id, field.id, e.target.value)
                                        }
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="">Select</option>
                                        {field.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value.toString() : JSON.stringify(value)}
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
            <div className="flex flex-wrap gap-4 w-full">
                {validFiles.map((fileUrl, index) => {
                    const fileName = fileUrl.split("/").pop() || "Download";
                    return (
                        <div
                            key={index}
                            className="flex flex-row gap-2 items-center border w-full p-2 rounded-md overflow-hidden"
                        >
                            {/* File Icon or Thumbnail */}
                            <div className="w-12 flex items-center justify-center">
                                {fileUrl.endsWith(".pdf") ? (
                                    <FaFilePdf size={48} />
                                ) : fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={fileUrl}
                                        alt="File Thumbnail"
                                        className="min-w-12 h-12 object-cover"
                                    />
                                ) : (
                                    <FaFileAlt size={48} />
                                )}
                            </div>

                            {/* File Name with Link */}
                            <div className="flex-1">
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm mt-2 break-all text-gray-700 dark:text-gray-300"
                                >
                                    {fileName}
                                </a>
                            </div>

                            {/* Download Button */}
                            <div>
                                <Button
                                    variant="default"
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
                                        }
                                    }}
                                    className="px-2 py-1 text-sm"
                                >
                                    Download
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };


    const renderVehicleDetails = (vehicleDetails: any) => {
        if (!Array.isArray(vehicleDetails) || vehicleDetails.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No vehicle details provided</span>;
        }

        return (
            <div className="space-y-4">
                {vehicleDetails.map((vehicle: any, index: number) => (
                    <div
                        key={index}
                        className="border p-4 rounded-md bg-red-500 dark:bg-gray-700 shadow-sm"
                    >
                        <h4 className="font-semibold mb-4 text-lg text-gray-800 dark:text-gray-200">
                            Vehicle #{index + 1}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Insurance Name
                                </label>
                                <span className="block text-gray-800 dark:text-gray-100">
                                    {vehicle.insuranceName || "N/A"}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Policy Number
                                </label>
                                <span className="block text-gray-800 dark:text-gray-100">
                                    {vehicle.policyNumber || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderEditableVehicleDetails = (vehicleDetails: any) => {
        if (!Array.isArray(vehicleDetails) || vehicleDetails.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No vehicle details provided</span>;
        }

        return (
            <div className="space-y-4">
                {vehicleDetails.map((vehicle: any, index: number) => (
                    <div
                        key={index}
                        className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700 shadow-sm"
                    >
                        <h4 className="font-semibold mb-4 text-lg text-gray-800 dark:text-gray-200">
                            Vehicle #{index + 1}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Insurance Name
                                </label>
                                <input
                                    type="text"
                                    value={vehicle.insuranceName || ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            claim.claim_id,
                                            `vehicle_details[${index}].insuranceName`,
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Policy Number
                                </label>
                                <input
                                    type="text"
                                    value={vehicle.policyNumber || ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            claim.claim_id,
                                            `vehicle_details[${index}].policyNumber`,
                                            e.target.value
                                        )
                                    }
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2"
                                />
                            </div>
                            {/* Add more editable fields as necessary */}
                        </div>
                    </div>
                ))}
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
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Header with Edit/Save/Cancel Buttons */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Accident Claim Details</h1>
                <div className="flex space-x-4">
                    {isEditing ? (
                        <>
                            <Button
                                variant="default"
                                onClick={() => handleSave(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition"
                            >
                                Save
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleCancel(claim.claim_id)}
                                className="flex items-center px-4 py-2 rounded-md transition"
                            >
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="default"
                            onClick={() => onEdit(claim.claim_id)}
                            className="flex items-center px-4 py-2 rounded-md transition"
                        >
                            Edit Claim
                        </Button>
                    )}
                </div>
            </div>

            {/* Iterate over formSections to display data */}
            {formSections.map((section) => (
                <section key={section.title} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                        {section.icon}
                        {section.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {section.fields.map((field) => {
                            // **IMPORTANT**: Ensure that 'file_uploads' field has been removed from formSections in form-config.ts
                            { renderAccidentTypeSection() }
                            if (field.id === "file_uploads") {
                                return null; // Skip rendering the 'file_uploads' field to prevent duplication
                            }

                            const path = field.id.split(".");
                            let value = getNestedValue(isEditing ? editedData : claim, path);

                            const renderValue = () => {

                                if (field.type === "file") {
                                    if (isEditing) {
                                        return (
                                            <div className="space-y-4 w-full">
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                                                        Existing Files
                                                    </h4>
                                                    {renderExistingFiles(existingFiles)}
                                                </div>
                                                <FileUpload
                                                    multiple
                                                    onFilesSelected={(files: File[]) =>
                                                        handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                                    }
                                                    className="mt-2"
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
                                            <select
                                                value={value}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                required={field.required}
                                            >
                                                <option value="">Select</option>
                                                {field.options?.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        );
                                    } else {
                                        const selectedOption = field.options?.find((opt) => opt.value === value);
                                        return <span className="text-gray-700 dark:text-gray-300">{selectedOption?.label || "N/A"}</span>;
                                    }
                                }

                                if (field.type === "textarea" || field.type === "text") {
                                    if (isEditing) {
                                        return (
                                            <textarea
                                                value={typeof value === "string" ? value : ""}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                required={field.required}
                                            />
                                        );
                                    } else {
                                        if (typeof value === "string") {
                                            return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                        } else if (typeof value === "object" && value !== null) {
                                            return (
                                                <ul>
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
                                        <ul>
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
                                        const dateValue = typeof value === "string" ? value.split("T")[0] : null;
                                        return (
                                            <DatePicker
                                                selectedDate={dateValue}
                                                onChange={(date) => {
                                                    if (date) {
                                                        const formattedDate = date.toISOString().split("T")[0];
                                                        handleFieldChange(claim.claim_id, field.id, formattedDate);
                                                    } else {
                                                        handleFieldChange(claim.claim_id, field.id, null);
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
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
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
                                            <input
                                                type={field.type}
                                                value={value}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                required={field.required}
                                            />
                                        );
                                    } else {
                                        return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                    }
                                }

                                if (field.type === "vehicleDetails") {
                                    return isEditing
                                        ? renderEditableVehicleDetails(vehicleDetails)
                                        : renderVehicleDetails(vehicleDetails);
                                }

                                // Handle unexpected field types or object structures
                                // if (typeof value === "object" && value !== null) {
                                //     return <span className="text-gray-700 dark:text-gray-300">{JSON.stringify(value)}</span>;
                                // }

                                if (Array.isArray(value)) {
                                    return (
                                        <ul>
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
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {formatLabel(field.label)}
                                    </label>
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
                            className="flex items-center px-4 py-2 rounded-md transition"
                        >
                            Save
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleCancel(claim.claim_id)}
                            className="flex items-center px-4 py-2 rounded-md transition"
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="default"
                        onClick={() => onEdit(claim.claim_id)}
                        className="flex items-center px-4 py-2 rounded-md transition"
                    >
                        Edit Claim
                    </Button>
                )}
            </div>
        </div>
    );

};

export default ClaimDetails;
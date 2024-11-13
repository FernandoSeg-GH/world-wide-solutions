// ClaimDetails.tsx

import React from "react";
import { EditableClaim } from "./AccidentClaimsView";
import { formSections } from "./config/form-config"; // Ensure form-config.ts has 'file_uploads' removed
import { FaFileAlt, FaFilePdf, FaTrash } from "react-icons/fa";
import FileDisplay from "./FileDisplay";
import { AccidentClaimFormData, Claim } from "./config/types";
import DatePicker from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload"; // Import your FileUpload component

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

function parseJSONField(field: string | null) {
    try {
        return field ? JSON.parse(field) : null;
    } catch {
        return null;
    }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ClaimDetails: React.FC<ClaimDetailsProps> = ({
    claim,
    onEdit,
    handleSave,
    handleCancel,
    handleFieldChange,
}) => {
    const { isEditing, editedData } = claim;


    const renderExistingFiles = (files?: string[] | null) => {
        if (!files || files.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No existing files</span>;
        }
        return (
            <div className="flex flex-wrap gap-4 w-full">
                {files.map((fileUrl, index) => (
                    <div key={index} className="flex flex-row gap-2 items-center border w-full p-2 rounded-md overflow-hidden">
                        <div className="w-12 flex items-center justify-center">
                            {fileUrl.endsWith(".pdf") ? (
                                <FaFilePdf size={48} />
                            ) : fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <img src={fileUrl} alt="File Thumbnail" className="min-w-12 h-12 object-cover" />
                            ) : (
                                <FaFileAlt size={48} />
                            )}
                        </div>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm mt-2">
                            {fileUrl.split("/").pop()}
                        </a>
                    </div>
                ))}
            </div>
        );
    };

    // Removed the second renderExistingFiles function to prevent duplication

    const renderVehicleDetails = (vehicleDetails: any) => {
        if (!Array.isArray(vehicleDetails) || vehicleDetails.length === 0) {
            return <span className="text-gray-500 dark:text-gray-400">No vehicle details provided</span>;
        }
        return vehicleDetails.map((vehicle: any, index: number) => (
            <div key={index} className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Vehicle #{index + 1}</h4>
                <p className="text-gray-700 dark:text-gray-300">
                    <strong>Insurance Name:</strong> {vehicle.insuranceName || "N/A"}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                    <strong>Policy Number:</strong> {vehicle.policyNumber || "N/A"}
                </p>
            </div>
        ));
    };

    console.log('claim', claim);

    // Extract existing files from claim
    const existingFiles = claim.file_uploads;
    // Extract new files from editedData
    const newFiles = isEditing ? editedData.new_file_uploads : null;

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
                            if (field.id === "file_uploads") {
                                return null; // Skip rendering the 'file_uploads' field to prevent duplication
                            }

                            const path = field.id.split(".");
                            let value = getNestedValue(isEditing ? editedData : claim, path);

                            const renderValue = () => {
                                // Inside the renderValue function for 'file' type
                                if (field.type === "file") {
                                    if (isEditing) {
                                        return (
                                            <div className="space-y-4 w-full">
                                                {/* Existing Files */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Existing Files</h4>
                                                    {renderExistingFiles(existingFiles)}
                                                </div>
                                                {/* New File Upload */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{formatLabel(field.label)}</h4>
                                                    <FileUpload
                                                        multiple
                                                        onFilesSelected={(files: File[]) =>
                                                            handleFieldChange(claim.claim_id, "new_file_uploads", files)
                                                        }
                                                        className="mt-2"
                                                    />
                                                    {/* Display previews of new files */}
                                                    {/* {newFiles && newFiles.length > 0 && (
                                                        <div className="mt-2 flex flex-col w-full gap-4">
                                                            {Array.from(newFiles).map((file, index) => (
                                                                <div key={index} className="file-thumbnail relative border rounded-lg p-2 shadow-sm">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={file.name}
                                                                        className="w-full h-20 object-cover rounded-md"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedFiles = Array.from(newFiles);
                                                                            updatedFiles.splice(index, 1);
                                                                            const dataTransfer = new DataTransfer();
                                                                            updatedFiles.forEach((f) => dataTransfer.items.add(f));
                                                                            handleFieldChange(claim.claim_id, "new_file_uploads", dataTransfer.files);
                                                                        }}
                                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                                                        aria-label="Remove file"
                                                                    >
                                                                        <FaTrash size={12} />
                                                                    </button>
                                                                    <p className="text-xs mt-1 truncate text-gray-600">{file.name}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )} */}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="space-y-2 w-full">
                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">{formatLabel(field.label)}</h4>
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

                                if (field.type === "conditionalSelect") {
                                    return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                }

                                if (field.type === "textarea") {
                                    if (isEditing) {
                                        return (
                                            <textarea
                                                value={typeof value === 'string' ? value : ''}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                required={field.required}
                                            />
                                        );
                                    } else {
                                        if (typeof value === 'string') {
                                            return <span className="text-gray-700 dark:text-gray-300">{value || "N/A"}</span>;
                                        } else if (Array.isArray(value)) {
                                            return (
                                                <ul>
                                                    {value.map((item, index) => (
                                                        <li key={index} className="text-gray-700 dark:text-gray-300">
                                                            {JSON.stringify(item)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            );
                                        } else if (typeof value === 'object' && value !== null) {
                                            return <span className="text-gray-700 dark:text-gray-300">{JSON.stringify(value)}</span>;
                                        } else {
                                            return <span className="text-gray-700 dark:text-gray-300">N/A</span>;
                                        }
                                    }
                                }

                                if (field.type === "date") {
                                    if (isEditing) {
                                        const dateValue = typeof value === "string" ? value.split("T")[0] : null;
                                        console.log(`Editing Mode: dateValue for ${field.id} is ${dateValue}`);
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
                                    let vehicleDetailsValue = typeof value === "string" ? parseJSONField(value) : value;
                                    return renderVehicleDetails(vehicleDetailsValue);
                                }

                                if (typeof value === "object" && !Array.isArray(value)) {
                                    return <span className="text-gray-700 dark:text-gray-300">{JSON.stringify(value) || "N/A"}</span>;
                                }

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
                            }

                            return (
                                <div key={field.id} className="flex flex-col">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">{formatLabel(field.label)}</h4>
                                    {renderValue()}
                                </div>
                            );
                        }
                        )}
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

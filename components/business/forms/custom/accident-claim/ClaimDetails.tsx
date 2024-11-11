// ClaimDetails.tsx

import React from "react";
import { EditableClaim } from "./AccidentClaimsView";
import { formSections } from "./config/form-config";
import { FaFileAlt, FaFilePdf } from "react-icons/fa";
import FileDisplay from "./FileDisplay";
import { AccidentClaimFormData, Claim } from "./config/types";

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
        return files.map((fileUrl, index) => (
            <FileDisplay key={`existing-${index}`} fileUrl={fileUrl} />
        ));
    };

    const renderNewFiles = (files: FileList | null) => {
        if (!files || files.length === 0)
            return <span className="text-gray-500 dark:text-gray-400">No new files uploaded</span>;
        return Array.from(files).map((file, index) => (
            <div key={`new-${index}`} className="flex items-center space-x-2">
                <FaFileAlt className="text-gray-600 text-2xl" />
                <span>{file.name}</span>
            </div>
        ));
    };

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

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Header with Edit/Save/Cancel Buttons */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Accident Claim Details</h1>
                <div className="flex space-x-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => handleSave(claim.claim_id)}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleCancel(claim.claim_id)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onEdit(claim.claim_id)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Edit Claim
                        </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.fields.map((field) => {
                            const path = field.id.split(".");
                            let value = getNestedValue(isEditing ? editedData : claim, path);

                            const renderValue = () => {
                                if (field.type === "file") {
                                    if (isEditing) {

                                        return <div className="space-y-2">{renderNewFiles(value as FileList | null)}</div>;
                                    } else {

                                        return <div className="space-y-2">{renderExistingFiles(value as string[] | null)}</div>;
                                    }
                                }

                                if (field.type === "select") {
                                    if (isEditing) {

                                        return (
                                            <select
                                                value={value}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
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

                                        const dateValue = typeof value === "string" ? value.split("T")[0] : "";
                                        return (
                                            <input
                                                type="date"
                                                value={dateValue || ""}
                                                onChange={(e) => handleFieldChange(claim.claim_id, field.id, e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2"
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
                            };

                            return (
                                <div key={field.id} className="flex flex-col">
                                    <label className="font-semibold text-gray-800 dark:text-gray-200">{formatLabel(field.label)}</label>
                                    <div className="mt-1">{renderValue()}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {/* File Uploads Section */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <FaFileAlt />
                    File Uploads
                </h2>
                {/* Always display existing files */}
                <div className="space-y-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Existing Files:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-1">
                        {renderExistingFiles(claim.file_uploads as string[] | null)}
                    </div>
                </div>

                {/* Show New Uploads only in edit mode */}
                {isEditing && (
                    <div className="mt-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">New Uploads:</span>
                        <div className="mt-1">
                            {renderNewFiles(editedData.file_uploads?.newDocumentFiles as FileList | null)}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );

};

export default ClaimDetails;

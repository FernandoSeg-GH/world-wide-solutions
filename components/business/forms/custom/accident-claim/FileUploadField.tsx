// components/FileUploadField.tsx
import { Label } from "@/components/ui/label";
import React from "react";
import { FaUpload } from "react-icons/fa";

interface FileUploadFieldProps {
    id: string;
    label: string;
    files: FileList | null;
    onChange: (files: FileList | null) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ id, label, files, onChange }) => {
    return (
        <div className="mb-4">
            <div className="bg-gray-200 p-4 rounded-md shadow">
                <Label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label} <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-3">
                    <input
                        type="file"
                        id={id}
                        name={id}
                        multiple
                        onChange={(e) => onChange(e.target.files)}
                        className="file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navyBlue file:text-white hover:file:bg-navyBlue block w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                    />
                    <FaUpload className="text-gray-400" aria-hidden="true" />
                </div>
            </div>
            {files && files.length > 0 && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {Array.from(files).map((file, index) => (
                        <p key={index} className="flex items-center">
                            <span className="inline-block truncate w-5/6">{file.name}</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploadField;

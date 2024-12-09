// components/FileUpload.tsx

import React from "react";
import { Button } from "./button";
import { FaFileUpload, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void; // Changed to File[] for flexibility
    className?: string;
    description?: string;
}

export function FileUpload({ multiple = false, onFilesSelected, className, description }: FileUploadProps) {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const updatedFiles = multiple ? [...selectedFiles, ...files] : files;
            setSelectedFiles(updatedFiles);
            onFilesSelected(updatedFiles);  // Send updated list of files

            // Clear input value to allow re-uploading the same file if needed
            event.target.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            const files = Array.from(event.dataTransfer.files);
            const updatedFiles = multiple ? [...selectedFiles, ...files] : files;
            setSelectedFiles(updatedFiles);
            onFilesSelected(updatedFiles);

            // Prevent default behavior
            event.stopPropagation();
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const removeFile = (index: number) => {
        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    return (
        <div className={cn("file-upload", className)}>
            <input
                type="file"
                ref={fileInputRef}
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {/* Dropzone Area */}
            <div
                className="dropzone border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors bg-white dark:bg-muted-dark"
                // onClick={handleButtonClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex flex-col items-center">
                    <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                    <p className="text-gray-600 max-w-[600px] my-3">
                        {description ?
                            description :
                            "Drag & drop files here, or click to select"
                        }
                    </p>
                    <Button type="button" className="mt-2" onClick={handleButtonClick}>
                        Upload File{multiple ? "s" : ""}
                    </Button>
                </div>
            </div>

            {/* Thumbnails / Previews */}
            {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="file-thumbnail relative border rounded-lg p-2 shadow-sm">
                            {file.type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-20 object-cover rounded-md"
                                />
                            ) : (
                                <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                            )}
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                aria-label="Remove file"
                            >
                                <FaTrash size={12} />
                            </button>
                            <p className="text-xs mt-1 truncate text-gray-600">{file.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FileUpload;

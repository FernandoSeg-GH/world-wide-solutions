// components/ui/file-upload.tsx

import React from "react";
import { Button } from "./button";
import { FaFileUpload, FaTrash } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface FileUploadProps {
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
    className?: string;
    description?: string;
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

export function FileUpload({ multiple = false, onFilesSelected, className, description }: FileUploadProps) {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const calculateTotalSize = (files: File[]) => {
        return files.reduce((acc, file) => acc + file.size, 0);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            let files = Array.from(event.target.files);

            // Filter out files exceeding MAX_FILE_SIZE
            const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
            if (oversizedFiles.length > 0) {
                toast({
                    title: "File Size Exceeded",
                    description: `Each file must be smaller than 25 MB. ${oversizedFiles.length} file(s) were not added.`,
                    variant: "destructive",
                });
                // Remove oversized files
                files = files.filter(file => file.size <= MAX_FILE_SIZE);
            }

            if (files.length === 0) return;

            const currentTotalSize = calculateTotalSize(selectedFiles);
            const newFilesTotalSize = calculateTotalSize(files);
            if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
                toast({
                    title: "Total File Size Exceeded",
                    description: `The total size of all files must be less than 50 MB.`,
                    variant: "destructive",
                });
                return;
            }

            const updatedFiles = multiple ? [...selectedFiles, ...files] : files;
            setSelectedFiles(updatedFiles);
            onFilesSelected(updatedFiles);

            // Clear input value to allow re-uploading the same file if needed
            event.target.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files) {
            let files = Array.from(event.dataTransfer.files);

            // Filter out files exceeding MAX_FILE_SIZE
            const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
            if (oversizedFiles.length > 0) {
                toast({
                    title: "File Size Exceeded",
                    description: `Each file must be smaller than 25 MB. ${oversizedFiles.length} file(s) were not added.`,
                    variant: "destructive",
                });
                // Remove oversized files
                files = files.filter(file => file.size <= MAX_FILE_SIZE);
            }

            if (files.length === 0) return;

            const currentTotalSize = calculateTotalSize(selectedFiles);
            const newFilesTotalSize = calculateTotalSize(files);
            if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
                toast({
                    title: "Total File Size Exceeded",
                    description: `The total size of all files must be less than 50 MB.`,
                    variant: "destructive",
                });
                return;
            }

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
            <p className="text-gray-600 text-sm font-base">Accepted file formats: DOC, PDF, CSV, XLSX, JPEG, JPG, PNG</p>

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
                                type="button"
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

// components/business/forms/custom/accident-claim/FileDisplay.tsx

import React from "react";
import Image from "next/image";
import { FaFilePdf, FaFileAlt } from "react-icons/fa";

interface FileDisplayProps {
    fileUrl: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ fileUrl }) => {
    const fileName = fileUrl.split("/").pop() || "file";
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension || "")) {
        return (
            <div className="w-32 h-32 relative">
                <Image
                    src={fileUrl}
                    alt={fileName}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md shadow-md"
                />
            </div>
        );
    } else if (fileExtension === "pdf") {
        return (
            <div className="flex items-center space-x-2">
                <FaFilePdf className="text-red-600 text-2xl" />
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {fileName}
                </a>
            </div>
        );
    } else {
        return (
            <div className="flex items-center space-x-2">
                <FaFileAlt className="text-gray-600 text-2xl" />
                <a href={fileUrl} download className="text-blue-500 hover:underline">
                    {fileName}
                </a>
            </div>
        );
    }
};

export default FileDisplay;

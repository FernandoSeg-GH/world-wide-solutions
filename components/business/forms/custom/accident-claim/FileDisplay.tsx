// components/business/forms/custom/accident-claim/FileDisplay.tsx

import React from "react";
import Image from "next/image";
import { FaFilePdf, FaFileAlt, FaFileImage, FaFileVideo, FaFileAudio } from "react-icons/fa";

interface FileDisplayProps {
    fileUrl: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ fileUrl }) => {
    const fileName = fileUrl.split("/").pop() || "file";
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension || "");
    const isVideo = ["mp4", "webm", "ogg"].includes(fileExtension || "");
    const isAudio = ["mp3", "wav", "aac"].includes(fileExtension || "");

    if (isImage) {
        return (
            <div className="w-32 h-32 relative rounded-md shadow-md overflow-hidden">
                <Image
                    src={fileUrl}
                    alt={fileName}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
        );
    } else if (fileExtension === "pdf") {
        return (
            <div className="flex items-center space-x-2">
                <FaFilePdf className="text-red-500 text-2xl" />
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {fileName}
                </a>
            </div>
        );
    } else if (isVideo) {
        return (
            <div className="flex items-center space-x-2">
                <FaFileVideo className="text-green-500 text-2xl" />
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {fileName}
                </a>
            </div>
        );
    } else if (isAudio) {
        return (
            <div className="flex items-center space-x-2">
                <FaFileAudio className="text-yellow-500 text-2xl" />
                <a href={fileUrl} download className="text-blue-500 hover:underline">
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

'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Download, Terminal } from 'lucide-react';
import { FormField } from '@/types';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface SubmissionDetailProps {
    row: { [key: string]: any };
    fieldKeys: string[];
    fieldMap: { [key: string]: FormField }; // Updated type
    createdAt: string;
    fileUrls?: string[]; // Optional array to handle multiple file URLs
    businessId: number;
    userId: number;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
    row,
    fieldKeys,
    fieldMap,
    createdAt,
    fileUrls,
    businessId,
    userId,
}) => {
    // Helper function to determine if a value is a file URL
    const isFileUrl = (value: string): boolean => {
        if (!value) return false;
        const extension = value.split('.').pop()?.toLowerCase();
        return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
    };

    // Helper function to check if the file is an image
    const isImage = (value: string): boolean => {
        if (!value) return false;
        const extension = value.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
    };

    // Download file handler
    const downloadFile = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        link.click();
    };

    // Construct base URL
    const baseUrl = `https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_${businessId}/user_id_${userId}`;

    // Find missing fields
    const missingFields = fieldKeys.filter((key) => row[key] === 'N/A');

    return (
        <div>
            <p>
                <strong>Submitted At:</strong> {new Date(createdAt).toLocaleString()}
            </p>

            {/* Show alert if there are missing fields */}
            {missingFields.length > 0 && (
                <Alert className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are missing fields in the submission: {missingFields.join(', ')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4">
                {fieldKeys.map((key) => (
                    <div key={key} className="flex justify-between py-1 border-b">
                        <span className="font-semibold">
                            {fieldMap[key]?.extraAttributes?.label || `Field ${key}`}:
                        </span>
                        <span>
                            {isFileUrl(row[key]) ? (
                                isImage(row[key]) ? (
                                    // Image Thumbnail with Popover and download option
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="p-0">
                                                <img
                                                    src={`${baseUrl}/${row[key]}`}
                                                    alt={fieldMap[key]?.extraAttributes?.label || 'Uploaded Image'}
                                                    className="w-16 h-16 object-cover cursor-pointer"
                                                />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <img
                                                src={`${baseUrl}/${row[key]}`}
                                                alt={fieldMap[key]?.extraAttributes?.label || 'Uploaded Image'}
                                                className="max-w-md max-h-96"
                                            />
                                            <Button
                                                variant="link"
                                                className="flex items-center gap-2 mt-2"
                                                onClick={() => downloadFile(`${baseUrl}/${row[key]}`, row[key])}
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Image
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    // Non-image file download button
                                    <Button
                                        variant="link"
                                        className="flex items-center gap-2"
                                        onClick={() => downloadFile(`${baseUrl}/${row[key]}`, row[key])}
                                    >
                                        <Download className="h-4 w-4" />
                                        Download File
                                    </Button>
                                )
                            ) : (
                                row[key]
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* Handle additional fileUrls if present */}
            {fileUrls && fileUrls.length > 0 && (
                <div className="mt-4">
                    <strong>Uploaded Files:</strong>
                    <ul className="list-disc list-inside">
                        {fileUrls.map((fileUrl, index) => (
                            <li key={index}>
                                {isFileUrl(fileUrl) ? (
                                    isImage(fileUrl) ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="p-0">
                                                    <img
                                                        src={`${baseUrl}/${fileUrl}`}
                                                        alt={`Uploaded File ${index + 1}`}
                                                        className="w-16 h-16 object-cover cursor-pointer"
                                                    />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <img
                                                    src={`${baseUrl}/${fileUrl}`}
                                                    alt={`Uploaded File ${index + 1}`}
                                                    className="max-w-md max-h-96"
                                                />
                                                <Button
                                                    variant="link"
                                                    className="flex items-center gap-2 mt-2"
                                                    onClick={() => downloadFile(`${baseUrl}/${fileUrl}`, fileUrl)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Image
                                                </Button>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <Button
                                            variant="link"
                                            className="flex items-center gap-2"
                                            onClick={() => downloadFile(`${baseUrl}/${fileUrl}`, fileUrl)}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download File
                                        </Button>
                                    )
                                ) : (
                                    fileUrl
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubmissionDetail;

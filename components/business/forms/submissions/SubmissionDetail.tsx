'use client';

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FormField } from '@/types';

interface SubmissionDetailProps {
    row: { [key: string]: any };
    fieldKeys: string[];
    fieldMap: { [key: string]: FormField };
    createdAt: string;
    fileUrls?: string[];
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
    row,
    fieldKeys,
    fieldMap,
    createdAt,
    fileUrls,
}) => {

    const isFileUrl = (value: string): boolean => {
        if (!value) return false;
        const extension = value.split('.').pop()?.toLowerCase();
        return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
    };


    const isImage = (value: string): boolean => {
        if (!value) return false;
        const extension = value.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');
    };

    return (
        <div>
            <p>
                <strong>Submitted At:</strong> {new Date(createdAt).toLocaleString()}
            </p>
            <div className="mt-4">
                {fieldKeys.map((key) => (
                    <div key={key} className="flex justify-between py-1  border-b ">
                        <span className="font-semibold">
                            {fieldMap[key]?.extraAttributes?.label || `Field ${key}`}:
                        </span>
                        <span>
                            {isFileUrl(row[key]) ? (
                                isImage(row[key]) ? (

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="p-0">
                                                <img
                                                    src={row[key]}
                                                    alt={fieldMap[key]?.extraAttributes?.label || 'Uploaded Image'}
                                                    className="w-16 h-16 object-cover cursor-pointer"
                                                />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <img
                                                src={row[key]}
                                                alt={fieldMap[key]?.extraAttributes?.label || 'Uploaded Image'}
                                                className="max-w-md max-h-96"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                ) : (

                                    <Button
                                        variant="link"
                                        className="flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
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
                                                        src={fileUrl}
                                                        alt={`Uploaded File ${index + 1}`}
                                                        className="w-16 h-16 object-cover cursor-pointer"
                                                    />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <img
                                                    src={fileUrl}
                                                    alt={`Uploaded File ${index + 1}`}
                                                    className="max-w-md max-h-96"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <Button
                                            variant="link"
                                            className="flex items-center gap-2"
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

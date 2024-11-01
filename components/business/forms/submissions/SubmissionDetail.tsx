import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Terminal } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface SubmissionDetailProps {
    row: { [key: string]: any };
    fieldKeys: string[];
    fieldMap: { [key: string]: { label: string; type: string; extraAttributes?: any } };
    created_at: string;
    fileUrls?: string[];
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
    row,
    fieldKeys,
    fieldMap,
    created_at,
    fileUrls,
}) => {
    // Identify missing fields
    const missingFields = fieldKeys.filter((key) => row[key] === 'N/A' || row[key] === null || row[key] === '');

    const renderField = (value: string, label: string) => {
        const isFile = value?.includes('.pdf') || value?.includes('.png');
        return isFile ? (
            <Button
                variant="link"
                onClick={() => window.open(value, '_blank')}
                className="flex items-center gap-2"
            >
                <Download className="h-4 w-4" />
                {label}
            </Button>
        ) : (
            <span>{value || 'N/A'}</span>
        );
    };

    return (
        <div className='w-full'>
            <p><strong>Submitted At:</strong> {new Date(created_at).toLocaleString()}</p>

            {/* Display alert for missing fields if any */}
            {missingFields.length > 0 && (
                <Alert className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        The following fields are missing data: {missingFields.map((key) => fieldMap[key]?.label || `Field ${key}`).join(', ')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4">
                {fieldKeys.map((key) => (
                    <div key={key} className="flex justify-between py-1 border-b">
                        <span className="font-semibold">
                            {fieldMap[key]?.label || `Field ${key}`}:
                        </span>
                        <span>{renderField(row[key] || 'N/A', fieldMap[key]?.label || `Field ${key}`)}</span>
                    </div>
                ))}
            </div>

            {fileUrls && fileUrls.length > 0 && (
                <div className="mt-4">
                    <strong>Uploaded Files:</strong>
                    <ul className="list-disc list-inside">
                        {fileUrls.map((url, idx) => (
                            <li key={idx}>{renderField(url, `File ${idx + 1}`)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubmissionDetail;

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubmissionDetailProps {
    row: { [key: string]: any } | undefined;
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
    if (!row || Object.keys(row).length === 0) {
        return <p>No data available.</p>;
    }

    const missingFields = fieldKeys.filter((key) => row[key] === undefined || row[key] === null || row[key] === '');

    const renderField = (value: string, label: string) => {
        const isFile = value?.includes('.pdf') || value?.includes('.png');
        return isFile ? (
            <Button
                variant="link"
                onClick={() => window.open(value, '_blank')}
                className="flex items-center gap-2 text-blue-500 dark:text-blue-300"
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
            <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>Submitted At:</strong> {new Date(created_at).toLocaleString()}</p>

            {missingFields.length > 0 && (
                <Alert className="mt-4 bg-yellow-100 dark:bg-yellow-900">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        The following fields are missing data: {missingFields.map((key) => fieldMap[key]?.label || `Field ${key}`).join(', ')}
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4 space-y-2">
                {fieldKeys.map((key) => (
                    <div key={key} className="flex justify-between py-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                            {fieldMap[key]?.label || `Field ${key}`}:
                        </span>
                        <span className="text-gray-800 dark:text-gray-100">{renderField(row[key] || 'N/A', fieldMap[key]?.label || `Field ${key}`)}</span>
                    </div>
                ))}
            </div>

            {fileUrls && fileUrls.length > 0 && (
                <div className="mt-4">
                    <strong className="text-gray-700 dark:text-gray-300">Uploaded Files:</strong>
                    <ul className="list-disc list-inside ml-4">
                        {fileUrls.map((url, idx) => (
                            <li key={idx} className="text-blue-500 dark:text-blue-300">
                                {renderField(url, `File ${idx + 1}`)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubmissionDetail;

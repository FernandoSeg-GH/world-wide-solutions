import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
        <div>
            <p><strong>Submitted At:</strong> {new Date(created_at).toLocaleString()}</p>
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

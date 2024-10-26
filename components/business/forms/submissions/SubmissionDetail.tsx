// src/components/submissions/SubmissionDetail.tsx

'use client';

import React from 'react';
import { format } from 'date-fns';

interface SubmissionDetailProps {
    row: { [key: string]: any };
    fieldKeys: string[];
    fieldMap: {
        [key: string]: { label: string; type: string; extraAttributes?: any };
    };
    createdAt: string | null;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ row, fieldKeys, fieldMap, createdAt }) => {
    function renderCellValue(key: string, value: any) {
        const field = fieldMap[key];
        const fieldType = field?.type;

        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-400">N/A</span>;
        }

        if (fieldType === 'SelectField' && typeof value === 'string') {
            const options = field.extraAttributes?.options || [];
            const selectedOption = options.find((option: any) => option.value === value);
            return selectedOption ? selectedOption.label : value;
        }

        if (fieldType === 'CheckboxField' && typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (fieldType === 'DateField' && typeof value === 'string') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date.toLocaleDateString();
        }

        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return value;
    }

    return (
        <div>
            <p>
                <strong>Created At:</strong>{' '}
                {createdAt ? format(new Date(createdAt), 'PPpp') : 'N/A'}
            </p>
            <div className="mt-2">
                {fieldKeys.map((key) => (
                    <div key={key} className="mb-2">
                        <strong>{fieldMap[key]?.label}:</strong> {renderCellValue(key, row[key])}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubmissionDetail;

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface SubmissionDetailProps {
    content: [string, { label: string; value: string | null }][];
    fieldMap?: Record<string, string>; // Make fieldMap optional
    createdAt: string | null;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ content, fieldMap, createdAt }) => {
    return (
        <div>
            <p><strong>Created At:</strong> {createdAt ? format(new Date(createdAt), 'PPpp') : 'N/A'}</p>
            <div>
                {content.map(([key, { label, value }]) => (
                    <div key={key} style={{ marginBottom: '5px' }}>
                        <strong>{label}:</strong> {value ?? 'N/A'}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubmissionDetail;

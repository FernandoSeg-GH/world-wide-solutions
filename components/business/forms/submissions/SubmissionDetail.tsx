'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface SubmissionDetailProps {
    content: Record<string, { label: string, value: string }>;
    fieldMap: Record<string, string>;
    createdAt: string | null;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({ content, fieldMap, createdAt }) => {
    const [expandedField, setExpandedField] = useState<string | null>(null);

    const toggleFieldExpand = (fieldKey: string) => {
        setExpandedField(expandedField === fieldKey ? null : fieldKey);
    };

    return (
        <div className="grid gap-4">
            <h4 className="font-semibold">Submission Details</h4>
            <ul className="grid gap-2">
                {Object.entries(content).map(([key, { label, value }], index) => {
                    return (
                        <li key={index} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{label}</span>
                            <span>
                                {typeof value === 'string' && value.length > 50 ? (
                                    <>
                                        {expandedField === key ? value : `${value.slice(0, 50)}...`}
                                        <Button
                                            onClick={() => toggleFieldExpand(key)}
                                            className="ml-2 text-blue-500 text-sm"
                                        >
                                            {expandedField === key ? 'Show less' : 'Show more'}
                                        </Button>
                                    </>
                                ) : (
                                    String(value)
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
            <Separator className="my-2" />
            <div className="font-semibold">Created At</div>
            <p>{createdAt ? format(new Date(createdAt), 'PPpp') : 'N/A'}</p>
        </div>
    );
};

export default SubmissionDetail;

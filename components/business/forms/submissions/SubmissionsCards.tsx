"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Submission } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowDownFromLineIcon } from 'lucide-react';
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface Field {
    id: string;
    type: string;
    extraAttributes: Record<string, any>;
}

interface Form {
    id: number;
    name: string;
    fields: Field[];
}

interface Props {
    submissions: Submission[];
    forms: Form[];
}

const SubmissionCards: React.FC<Props> = ({ submissions, forms }) => {
    const [expandedSubmissionId, setExpandedSubmissionId] = useState<number | null>(null);
    const [expandedField, setExpandedField] = useState<string | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedSubmissionId(expandedSubmissionId === id ? null : id);
    };

    const toggleFieldExpand = (fieldKey: string) => {
        setExpandedField(expandedField === fieldKey ? null : fieldKey);
    };

    const fieldMap = forms.reduce((acc, form) => {
        if (Array.isArray(form.fields)) {
            form.fields.forEach(field => {
                acc[field.id] = field.extraAttributes?.label || field.id;
            });
        }
        return acc;
    }, {} as Record<string, string>);


    if (forms.length === 0) {
        return <div>No Submissions available</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {submissions.map((submission: Submission) => {
                const isExpanded = expandedSubmissionId === submission.id;
                let contentParsed: Record<string, any> = {};

                if (submission.content) {
                    try {
                        contentParsed = JSON.parse(String(submission.content));
                    } catch (error) {
                        console.error(`Error parsing content for submission ID ${submission.id}:`, error);
                    }
                }

                return (
                    <Card key={submission.id} className="overflow-hidden shadow-md">
                        <CardHeader className="flex flex-col bg-muted/50 p-4">
                            <CardTitle className="flex justify-between items-center text-lg font-semibold">
                                Submission ID: {submission.id}
                                <Button onClick={() => toggleExpand(submission.id)} variant={isExpanded ? "outline" : "default"}>
                                    {isExpanded ? 'Collapse' : 'Details'} {isExpanded ? <DoubleArrowUpIcon width={12} height={12} className='ml-2' /> : <DoubleArrowDownIcon width={12} height={12} className='ml-2' />}
                                </Button>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Form ID: {submission.formId || 'N/A'} - User ID: {submission.user_id || 'N/A'}
                            </p>
                        </CardHeader>
                        {isExpanded && (
                            <CardContent className="p-4">
                                <div className="grid gap-4">
                                    <h4 className="font-semibold">Submission Details</h4>
                                    <ul className="grid gap-2">
                                        {Object.entries(contentParsed).map(([key, value], index) => {
                                            const fieldName = fieldMap[key] || key;
                                            return (
                                                <li key={index} className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">{fieldName}</span>
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
                                    <p>
                                        {submission.createdAt
                                            ? format(new Date(submission.createdAt), 'PPpp')
                                            : 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                );
            })}
        </div>
    );
};

export default SubmissionCards;


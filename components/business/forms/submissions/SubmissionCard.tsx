'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DoubleArrowDownIcon, DoubleArrowUpIcon } from '@radix-ui/react-icons';
import { Form, Submission } from '@/types';
import SubmissionDetail from './SubmissionDetail';
import { cn } from '@/lib/utils';

interface SubmissionCardProps {
    submission: Submission;
    contentParsed: Record<string, { label: string, value: string }>;
    form: Form;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ form, submission, contentParsed }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const fieldMap: Record<string, string> = form.fields?.reduce((acc, field) => {
        acc[field.id] = field.extraAttributes?.label || field.id;
        return acc;
    }, {} as Record<string, string>) || {};

    return (
        <Card className="overflow-hidden shadow-md mb-4 dark:bg-muted/10">
            <CardHeader className="flex flex-col p-4">
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    Submission ID: {submission.id}
                    <Button onClick={toggleExpand} variant={isExpanded ? "outline" : "default"} className={cn("dark:bg-primary dark:text-white")}>
                        {isExpanded ? 'Collapse' : 'Details'}{' '}
                        {isExpanded ? <DoubleArrowUpIcon width={12} height={12} className='ml-2' /> : <DoubleArrowDownIcon width={12} height={12} className='ml-2' />}
                    </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Form ID: {submission.formId || 'N/A'} - User ID: {submission.userId || 'N/A'}
                </p>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4 dark:bg-gray-300">
                    <SubmissionDetail
                        content={contentParsed}
                        fieldMap={fieldMap}
                        createdAt={submission.createdAt}
                    />
                </CardContent>
            )}
        </Card>
    );
};

export default SubmissionCard;

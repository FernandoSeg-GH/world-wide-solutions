"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Submission, Form } from '@/types';
import SubmissionDetail from './SubmissionDetail';
import { useFieldMapping } from '@/hooks/forms/useFieldMapping';

interface SubmissionCardProps {
    submission: Submission;
    form: Form;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ form, submission }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { fieldKeys, fieldMap } = useFieldMapping(form, submission.content);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Card key={submission.id} className="overflow-hidden shadow-lg rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-xl   dark:bg-gray-800 dark:border-gray-700 max-w-[600px]">
            <CardHeader className="flex flex-row justify-between items-center p-4 cursor-pointer bg-gray-200 dark:bg-gray-700 rounded-t-lg" onClick={toggleExpand}>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Submission ID: {submission.id}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(submission.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4 transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-800">
                    <SubmissionDetail
                        row={submission.content}
                        fieldKeys={fieldKeys}
                        fieldMap={fieldMap}
                        created_at={submission.created_at}
                        fileUrls={submission.fileUrls}
                    />
                </CardContent>
            )}
        </Card>
    );
};

export default SubmissionCard;

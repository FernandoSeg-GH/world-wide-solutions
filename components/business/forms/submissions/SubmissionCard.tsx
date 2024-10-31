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
    const { fieldKeys, fieldMap } = useFieldMapping(form);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    console.log("Field Keys:", fieldKeys);
    console.log("Submission Content:", submission.content);

    return (
        <Card key={submission.id} className="overflow-hidden shadow-md text-black dark:text-white">
            <CardHeader className="flex flex-col p-4 cursor-pointer" onClick={toggleExpand}>
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    <span>Submission ID: {submission.id}</span>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </CardTitle>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4">
                    <SubmissionDetail
                        row={submission.content ?? {}} // Check if content aligns with fieldKeys
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

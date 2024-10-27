'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Form, Submission, SubmissionStatusEnum } from '@/types';
import SubmissionDetail from './SubmissionDetail';
import { useFieldMapping } from '@/hooks/forms/useFieldMapping';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SubmissionCardProps {
    submission: Submission;
    form: Form;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ form, submission }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [localStatus, setLocalStatus] = useState<string>(submission.status);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const { updateSubmissionStatus, fetchSubmissions } = useSubmissions();
    const { data: session } = useSession();

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const { fieldKeys, fieldMap } = useFieldMapping(form);

    // Parse submission content
    let contentParsed: Record<string, { label: string; value: string | null }> = {};

    if (submission.content) {
        try {
            contentParsed =
                typeof submission.content === 'string' ? JSON.parse(submission.content) : submission.content;
        } catch (error) {
            console.error(`Error parsing content for submission ID ${submission.id}:`, error);
        }
    }

    // Construct row data similar to SubmissionsTable
    const row: { [key: string]: any } = {};

    fieldKeys.forEach((key) => {
        const fieldValue = contentParsed[key];
        if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
            row[key] = fieldValue.value;
        } else {
            row[key] = fieldValue;
        }
    });

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await updateSubmissionStatus(submission.id, newStatus);
            setLocalStatus(newStatus);
            // Optionally, you can trigger a re-fetch if needed
            // await fetchSubmissions(form.share_url);
        } catch (error) {
            console.error("Error updating submission status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // useEffect(() => {
    //     // Sync localStatus with the submission prop in case it changes from the parent
    //     setLocalStatus(submission.status);
    // }, [submission.status]);

    const userRoleId = Number(session?.user?.role?.id) || 0;
    const isBusinessUser = [2, 3, 4].includes(userRoleId);
    const submissionStatus = localStatus || 'STATUS UNKNOWN';

    // Function to determine the color of the status indicator
    const statusColor = useCallback((status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-500";
            case "REJECTED":
                return "bg-red-500";
            case "PENDING":
            case "RECEIVED":
                return "bg-gray-500";
            case "REVIEWING":
            case "PROCESSING":
            case "STARTED":
                return "bg-yellow-500";
            default:
                return "bg-gray-300";
        }
    }, []);

    return (
        <Card key={submission.id} className="overflow-hidden shadow-md">
            <CardHeader className="flex flex-col bg-muted/50 p-4" onClick={toggleExpand}>
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 mr-2 rounded-full ${statusColor(submissionStatus)}`} />
                        Submission ID: {submission.id}
                    </div>
                    <div className="flex items-center gap-2">
                        {submissionStatus ? (
                            isBusinessUser ? (
                                <Select
                                    value={submissionStatus}
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="w-full">
                                        {isUpdating ? <Skeleton className="w-20 h-5" /> : <SelectValue placeholder="Select status" />}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(SubmissionStatusEnum).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant="outline" className={`status-${submissionStatus}`}>
                                    {submissionStatus}
                                </Badge>
                            )
                        ) : null}
                        {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </div>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Form ID: {submission.formId || 'N/A'} - User ID: {submission.userId || 'N/A'}
                </p>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4">
                    {isUpdating ? (
                        <Skeleton className="h-10 w-full" /> // Display skeleton while updating
                    ) : (
                        <SubmissionDetail
                            row={row}
                            fieldKeys={fieldKeys}
                            fieldMap={fieldMap}
                            createdAt={submission.createdAt}
                        />
                    )}
                </CardContent>
            )}
        </Card>
    );

};

export default SubmissionCard;

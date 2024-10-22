'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Submission } from '@/types'
import SubmissionDetail from './SubmissionDetail'

interface SubmissionCardProps {
    submission: Submission
    contentParsed: Record<string, { label: string; value: string | null }>
}

export default function SubmissionCard({ submission, contentParsed }: SubmissionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpand = () => setIsExpanded(!isExpanded)

    const filteredContent = Object.entries(contentParsed).filter(
        ([_, { value }]) => value !== null && value !== 'N/A' && value !== ''
    )

    return (
        <Card className="mb-4 bg-white dark:bg-muted-dark dark:text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">Submission {submission.formId}</CardTitle>
                <Button onClick={toggleExpand} variant="ghost" size="sm">
                    {isExpanded ? (
                        <>
                            Collapse <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Details <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="font-medium">User ID:</span> {submission.userId}
                    </div>
                    <div>
                        <span className="font-medium">Created At:</span>{' '}
                        {new Date(submission.createdAt).toLocaleString()}
                    </div>
                </div>
                {isExpanded && (
                    <div className="mt-4">
                        <SubmissionDetail content={filteredContent} createdAt={submission.createdAt} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
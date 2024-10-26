// src/components/submissions/SubmissionCard.tsx

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Form, Submission } from '@/types'
import SubmissionDetail from './SubmissionDetail'
import { useFieldMapping } from '@/hooks/forms/useFieldMapping'

interface SubmissionCardProps {
    submission: Submission
    form: Form
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ form, submission }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false)

    const toggleExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const { fieldKeys, fieldMap } = useFieldMapping(form)

    // Parse submission content
    let contentParsed: Record<string, { label: string; value: string | null }> = {}

    if (submission.content) {
        try {
            contentParsed =
                typeof submission.content === 'string' ? JSON.parse(submission.content) : submission.content
        } catch (error) {
            console.error(`Error parsing content for submission ID ${submission.id}:`, error)
        }
    }

    // Construct row data similar to SubmissionsTable
    const row: { [key: string]: any } = {}

    fieldKeys.forEach((key) => {
        const fieldValue = contentParsed[key]
        if (fieldValue && typeof fieldValue === 'object' && 'value' in fieldValue) {
            row[key] = fieldValue.value
        } else {
            row[key] = fieldValue
        }
    })

    return (
        <Card key={submission.id} className="overflow-hidden shadow-md">
            <CardHeader className="flex flex-col bg-muted/50 p-4">
                <CardTitle className="flex justify-between items-center text-lg font-semibold">
                    Submission ID: {submission.id}
                    <Button onClick={toggleExpand} variant={isExpanded ? "outline" : "default"}>
                        {isExpanded ? 'Collapse' : 'Details'}{' '}
                        {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Form ID: {submission.formId || 'N/A'} - User ID: {submission.userId || 'N/A'}
                </p>
            </CardHeader>
            {isExpanded && (
                <CardContent className="p-4">
                    <SubmissionDetail
                        row={row}
                        fieldKeys={fieldKeys}
                        fieldMap={fieldMap}
                        createdAt={submission.createdAt}
                    />
                </CardContent>
            )}
        </Card>
    )
}

export default SubmissionCard

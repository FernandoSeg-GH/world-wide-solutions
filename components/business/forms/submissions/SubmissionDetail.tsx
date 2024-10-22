'use client'

import React from 'react'
import { format } from 'date-fns'

interface SubmissionDetailProps {
    content: Array<[string, { label: string; value: string | null }]>
    createdAt: string | null
}

export default function SubmissionDetail({ content, createdAt }: SubmissionDetailProps) {
    return (
        <div className="space-y-2">
            <p className="text-sm">
                <span className="font-medium">Created At:</span>{' '}
                {createdAt ? format(new Date(createdAt), 'PPpp') : 'N/A'}
            </p>
            <div className="grid gap-2">
                {content.map(([key, { label, value }]) => (
                    <div key={key} className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">{label}:</span>
                        <span>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

type StatCardProps = {
    title: string
    icon: React.ReactNode
    value: number
    description?: string
}

const StatCard = ({ title, icon, value, description }: StatCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium"><span>{title}</span></CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>

    )
}

export default StatCard
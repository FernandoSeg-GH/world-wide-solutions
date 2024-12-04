import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react'
import React from 'react'
import TotalRevenue from './TotalRevenue'
import Subscriptions from './Subscriptions'
import Sales from './Sales'
import ActiveNow from './ActiveNow'

type Props = {}

function Stats({ }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <TotalRevenue qty={1100} change={90} />
            <Subscriptions qty={1} change={120} />
            <Sales qty={1} change={100} />
            <ActiveNow qty={4} change={14} />
        </div>
    )
}

export default Stats
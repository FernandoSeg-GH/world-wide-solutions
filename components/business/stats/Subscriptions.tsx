import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react'
import React from 'react'


type Props = {
    qty: number
    change: number
}

function Subscriptions({ qty, change }: Props) {
    return (

        <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{qty}</div>
                <p className="text-xs text-muted-foreground">
                    +{change}% from last month
                </p>
            </CardContent>
        </Card>

    )
}

export default Subscriptions
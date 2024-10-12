import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppContext } from '@/context/AppProvider'
import { Users, Briefcase, FileText, DollarSign } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import StatCard from './StatCard'

const BusinessStats = () => {
    const { data, actions } = useAppContext()
    const { businesses, subscriptionPlans, forms, loading } = data
    const { getAllBusinesses, fetchSubscriptionPlans, fetchAllForms } = actions

    const [userCount, setUserCount] = useState<number>(0)

    useEffect(() => {
        getAllBusinesses()
        fetchSubscriptionPlans()
        fetchAllForms()

        // Simulate fetching all users (you can replace this with your actual API call to get user count)
        fetch('/api/users') // replace with your actual API route for fetching users
            .then((res) => res.json())
            .then((data) => setUserCount(data.length)) // assuming the response gives an array of users
            .catch((error) => console.error(error))
    }, [getAllBusinesses, fetchSubscriptionPlans, fetchAllForms])

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard
                title="Businesses Created"
                icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                value={businesses?.length || 0}
                description="+10% since last month"
            />
            <StatCard
                title="Users Subscribed"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                value={userCount}
                description="+5% since last month"
            />
            <StatCard
                title="Forms Created"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                value={forms?.length || 0}
                description="+8% since last month"
            />
            <StatCard
                title="Total Subscriptions"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                value={subscriptionPlans?.length || 0}
                description="+12% since last month"
            />
        </div>
    )
}

export default BusinessStats

"use client"
import { useAppContext } from '@/context/AppProvider'
import { Users, Briefcase, FileText, DollarSign } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import StatCard from './StatCard'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/user/useUser'
import { useGodMode } from '@/hooks/user/useGodMode'

const BusinessStats = () => {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext()
    const { businesses, subscriptionPlans, forms, loading } = data
    const { getAllBusinesses, fetchSubscriptionPlans, formActions } = actions

    const { users, fetchAllUsers } = useUser();
    const [userCount, setUserCount] = useState<number>(0)

    useEffect(() => {
        getAllBusinesses()
        fetchSubscriptionPlans()
        formActions.fetchAllForms()

        if (session?.user?.role?.id && session?.user?.businessId) {
            fetchAllUsers().then((data) => {
                if (data) {
                    setUserCount(data.length)
                }
            }).catch((error) => console.error("Error fetching users:", error))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.role?.id, session?.user?.businessId])

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

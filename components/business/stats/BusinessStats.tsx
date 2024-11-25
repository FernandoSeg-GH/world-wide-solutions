"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Briefcase, FileText, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

const BusinessStats = () => {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        usersCount: 0,
        claimsCount: 0,
        messagesCount: 0,
        newMessagesCount: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine the endpoint based on the user's role
                const endpoint =
                    session?.user?.role?.id === 1
                        ? `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/user_stats`
                        : `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/business_stats`;

                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stats.");
                }

                const data = await response.json();

                // Dynamically map stats based on the response
                setStats({
                    usersCount: data.users_count || 0,
                    claimsCount: data.claims_count || 0,
                    messagesCount: data.messages_count || 0,
                    newMessagesCount: data.new_messages_count || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (session?.accessToken) {
            fetchStats();
        }
    }, [session?.accessToken, session?.user?.role?.id]);

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <StatCard
                title="Users Count"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                value={stats.usersCount}
                description={session?.user?.role?.id === 1 ? "+2 claims added this month" : "+5% since last month"}
            />
            <StatCard
                title="Claims Count"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                value={stats.claimsCount}
                description={session?.user?.role?.id === 1 ? "+1 claim reviewed" : "+8% since last month"}
            />
            <StatCard
                title="Messages Sent"
                icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                value={stats.messagesCount}
                description="+10% since last month"
            />
            <StatCard
                title="New Messages"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                value={stats.newMessagesCount}
                description="+12% since last month"
            />
        </div>
    );
};

export default BusinessStats;

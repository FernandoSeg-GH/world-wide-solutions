"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Briefcase, FileText, DollarSign, Mail, MessageCircle } from "lucide-react";
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
                const response = await fetch("/api/business/stats");

                if (!response.ok) {
                    throw new Error("Failed to fetch stats.");
                }

                const data = await response.json();

                setStats({
                    usersCount: data.usersCount,
                    claimsCount: data.claimsCount,
                    messagesCount: data.messagesCount,
                    newMessagesCount: data.newMessagesCount,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (session?.accessToken) {
            fetchStats();
        }
    }, [session?.accessToken]);


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
                icon={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
                value={stats.messagesCount}
                description="+10% since last month"
            />
            <StatCard
                title="New Messages"
                icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                value={stats.newMessagesCount}
                description="+12% since last month"
            />
        </div>
    );
};

export default BusinessStats;

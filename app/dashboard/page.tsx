"use client"
import { useSession } from "next-auth/react";
import Dashboard from "@/components/layout/Dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    if (status === "loading") {
        return <Skeleton />;
    }

    if (!session?.accessToken) {
        router.push("/auth/sign-in");
    }

    return <Dashboard />;
}

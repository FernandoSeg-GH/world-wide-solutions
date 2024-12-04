"use client"
import AuthForm from "@/components/auth/AuthForm";
import { useSession } from "next-auth/react";
import Dashboard from "@/components/layout/Dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


export default function HomePage() {

    const { data: session, status } = useSession();
    const router = useRouter();
    if (status === "loading") {
        // Show a skeleton while session data is loading
        return <Skeleton />;
    }

    if (!session?.accessToken) {
        return <AuthForm />
    }

    return <Dashboard />;


}

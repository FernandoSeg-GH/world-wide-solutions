"use client"
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function TokenRefresher() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.accessToken) return;

        const refreshInterval = setInterval(async () => {
            try {
                const response = await fetch("/api/auth/refresh", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                if (!response.ok) {
                    console.error("Failed to refresh token");
                    signOut();
                    return;
                }

                const refreshedTokens = await response.json();
                session.accessToken = refreshedTokens.accessToken;
                session.accessToken = refreshedTokens.refreshToken;
            } catch (error) {
                console.error("Error refreshing token:", error);
                signOut();
            }
        }, 10 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [session]);

    return null;
}

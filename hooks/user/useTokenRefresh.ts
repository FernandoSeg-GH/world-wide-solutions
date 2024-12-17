"use client";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

const useTokenRefresh = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessTokenExpires) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = (session?.accessTokenExpires ?? 0) - now;

      if (timeLeft < 5 * 60 * 1000) {
        // Trigger token refresh 5 minutes before expiration
        signIn("credentials", { redirect: false });
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [status, session]);

  return null;
};

export default useTokenRefresh;

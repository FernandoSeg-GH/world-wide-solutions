'use client';

import { useSession } from "next-auth/react";
import Dashboard from "@/components/layout/Dashboard";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user) {
      console.log('session.user', session.user)
    }
  }, [session]);

  return (<Dashboard />);
}

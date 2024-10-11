'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/components/context/AppContext";
import Dashboard from "@/components/layout/Dashboard";
import { useEffect } from "react";

export default function Laboratory() {
  const { data: session } = useSession();
  const { data, actions } = useAppContext();
  const { form, submissions, loading: formLoading, loading, forms } = data;
  const { fetchForms } = actions;

  useEffect(() => {
    if (session?.user) {
      // fetchForms(session.user.businessId); 
      console.log('session.user', session.user)
    }
  }, [session, fetchForms]);

  return (
    <div className="p-4 pb-20 w-full flex flex-col justify-start items-start">
      {/* {loading || formLoading ? <Skeleton className="min-w-80 w-full min-h-20" /> : null} */}
      <Dashboard />
    </div>
  );
}

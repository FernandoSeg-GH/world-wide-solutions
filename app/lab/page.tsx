'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/components/context/AppContext";
import Dashboard from "@/components/layout/Dashboard";

export default function Laboratory() {
  const { data: session } = useSession();
  const { data, actions } = useAppContext();
  const { form, submissions, loading: formLoading, loading, forms } = data;
  const { fetchForms } = actions;

  // useEffect(() => {
  //   if (session?.user?.businessId) {
  //     fetchForms(session.user.businessId); // Fetch forms for the logged-in user's business
  //   }
  // }, [session, fetchForms]); // Dependencies: session and fetchForms

  return (
    <div className="p-4 pb-20 w-full flex flex-col justify-start items-start">
      {/* {loading || formLoading ? <Skeleton className="min-w-80 w-full min-h-20" /> : null} */}
      <Dashboard />
    </div>
  );
}

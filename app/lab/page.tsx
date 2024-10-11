'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
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

  return (<Dashboard />);
}

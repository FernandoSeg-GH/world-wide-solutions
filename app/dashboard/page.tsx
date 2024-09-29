'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import CreateFormBtn from "@/components/forms/CreateFormButton";
import FormCards from "@/components/forms/FormCards";
import Welcome from "@/components/user/Welcome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientView from "@/components/forms/ClientView";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import { useAppContext } from "@/components/context/AppContext";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { data, actions } = useAppContext();
  const router = useRouter();
  const { form, submissions, loading: formLoading } = data;

  useEffect(() => {
    const fetchFormAndSubmissions = async () => {
      if (status === "authenticated" && session?.user?.businessId) {
        if (!form) {
          // Fetch the form if it doesn't exist in the state
          await actions.fetchFormByShareUrlPublic('your-share-url'); // Ensure shareURL is available
        }

        if (form?.shareURL) {
          console.log("Fetching submissions for shareURL:", form.shareURL);
          await actions.fetchSubmissions(form.shareURL); // Fetch submissions if form has a shareURL
        }

        setIsLoading(false);
      } else if (status === "unauthenticated") {
        setIsLoading(false);
        router.push("/");
      }
    };

    fetchFormAndSubmissions();
  }, [status, form, actions, router]);


  useEffect(() => {
    if (submissions) {
      console.log('Submissions:', submissions);
    }
  }, [submissions]);
  console.log('form', form)
  return (
    <div className="p-4 w-full flex flex-col justify-start items-start">
      <Welcome />
      {
        isLoading || formLoading ?
          <Skeleton className="min-w-80 min-h-20" /> : (
            <div>
              {session?.user.role.id === 4 ? (
                <div className="w-full">
                  {session.user.businessId ? (
                    <div>
                      <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                        <CreateFormBtn />
                        <FormCards />
                      </div>
                    </div>
                  ) : (
                    <CreateBusinessForm />
                  )}
                </div>
              ) : null}
              {form && session?.user.role.id === 1 ? (
                <ClientView form={form} submissions={submissions} />
              ) : (
                <div>
                  <p>You haven't submitted any form.</p>
                </div>
              )}
            </div>
          )}
    </div>
  );
}

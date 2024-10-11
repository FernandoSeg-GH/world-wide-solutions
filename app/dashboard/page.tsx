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
import { useAppContext } from "@/context/AppContext";
import SubmissionsTable from "@/components/forms/SubmissionTable";
import SubmissionFormCard from "@/components/forms/SubmissionFormCard";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data, actions } = useAppContext();
  const { form, submissions, loading: formLoading, loading, forms } = data;
  const { fetchForms } = actions;

  useEffect(() => {
    if (session?.user?.businessId) {
      fetchForms(session.user.businessId); // Fetch forms for the logged-in user's business
    }
  }, [session, fetchForms]); // Dependencies: session and fetchForms

  return (
    <div className="p-4 pb-20 w-full flex flex-col justify-start items-start">
      <Welcome />
      {/* {loading || formLoading ? <Skeleton className="min-w-80 w-full min-h-20" /> : null} */}

      <div className="w-full">
        {!session?.user?.businessId && session?.user?.role.id !== 1 ?
          <CreateBusinessForm /> : null
        }
        {forms && session?.user.role.id !== 1 ? (
          <div className="px-4 py-6 border w-full mt-10 rounded-lg text-left shadow-md">
            <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>
            {/* {forms.map((form) => <p key={form?.name}>{form.name}</p>)} */}
            <FormCards forms={forms} />
          </div>
        ) : <SubmissionFormCard forms={forms} />
        }
      </div>
      <div className="flex flex-col gap-6 w-full">
        <div>
          {form && session?.user.role.id !== 1 && forms && submissions ?
            forms.map((form, index) =>
              <SubmissionsTable key={index} form={form} submissions={submissions} admin />
            )
            : null
          }
        </div>
        <div className="w-full">
          {form ?
            <ClientView form={form} submissions={submissions ?? []} />
            : null
          }
        </div>
      </div>
    </div>
  );
}

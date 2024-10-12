
'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppContext";
import { useEffect } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "../business/BusinessesTable";
import { useGodMode } from "@/hooks/useGodMode";
import FormCards from "../forms/FormCards";
import SubmissionFormCard from "../forms/SubmissionFormCard";
import SubmissionsTable from "../forms/SubmissionTable";
import ClientView from "../forms/ClientView";

export default function Main() {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { fetchForms } = actions;

    useEffect(() => {
        if (session?.user?.businessId) {
            fetchForms(session.user.businessId);
        }
    }, [session, fetchForms]);

    return (
        <div className="flex h-full w-full flex-col bg-muted/40">
            <Welcome />

            {godMode ? (
                <div className="w-full flex flex-col gap-6 px-4">
                    <CreateBusinessForm />
                    <BusinessesTable />
                    <div className="w-full">
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
            ) : null}
        </div>
    );
}


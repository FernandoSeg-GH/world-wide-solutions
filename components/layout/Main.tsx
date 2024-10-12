'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/context/AppProvider";
import { useEffect } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import BusinessesTable from "../business/BusinessesTable";
import { useGodMode } from "@/hooks/useGodMode";

export default function Main() {
    const { data: session } = useSession();
    const { godMode } = useGodMode();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { fetchFormsByBusinessId } = actions;

    useEffect(() => {
        if (session?.user?.businessId) {
            fetchFormsByBusinessId(session.user.businessId);
        }
    }, [session]);
    useEffect(() => {
        if (form) {
            console.log('form', form)
        }
    }, [form]);

    return (
        <div className="flex h-full w-full flex-col bg-muted/40">
            <Welcome />

            {godMode ? (
                <div className="w-full flex flex-col gap-6 px-4">
                    {/* Create Business Form */}
                    <CreateBusinessForm />

                    {/* Businesses Table */}
                    <BusinessesTable />
                    {/* {form ? <FormCard form={form} /> : "No Form"} */}
                    {/* Form Cards and Submission Form Card */}
                    {/* <div className="w-full">
                        {loading ? (
                            <div className="text-center">Loading forms...</div>
                        ) : forms && session?.user?.role?.id !== 1 ? (
                            <div className="px-4 py-6 border w-full mt-10 rounded-lg text-left shadow-md">
                                <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>
                                <FormCards forms={forms} />
                            </div>
                        ) : (
                            <SubmissionFormCard forms={forms} />
                        )}
                    </div> */}

                    {/* Submissions Table */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* <div>
                            {form && session?.user?.role?.id !== 1 && forms && submissions ? (
                                forms.map((form, index) => (
                                    <SubmissionsTable key={index} form={form} submissions={submissions} admin />
                                ))
                            ) : (
                                <p>No forms or submissions available.</p>
                            )}
                        </div> */}

                        {/* Client View */}
                        {/* <div className="w-full">
                            {form ? (
                                <ClientView form={form} submissions={submissions ?? []} />
                            ) : null}
                        </div> */}
                    </div>
                </div>
            ) : (
                <p className="text-center">You do not have access to this view.</p>
            )}
        </div>
    );
}

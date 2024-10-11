
'use client';

import { useSession } from "next-auth/react";
import { useAppContext } from "@/components/context/AppContext";
import { useEffect, useState } from "react";
import Welcome from "@/components/user/Welcome";
import CreateBusinessForm from "@/components/business/CreateBusinessForm";
import FormCards from "@/components/forms/FormCards";
import SubmissionFormCard from "@/components/forms/SubmissionFormCard";
import SubmissionsTable from "@/components/forms/SubmissionTable";
import ClientView from "@/components/forms/ClientView";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Body } from "./Body";
import { mockData } from "./mock-data";

export default function Dashboard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: session } = useSession();
    const { data, actions } = useAppContext();
    const { form, submissions, loading: formLoading, loading, forms } = data;
    const { fetchForms } = actions;

    // useEffect(() => {
    //     if (session?.user?.businessId) {
    //         fetchForms(session.user.businessId);
    //     }
    // }, [session, fetchForms]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                sidebarItems={mockData.sidebarItems}
            />
            <div
                className={`flex flex-col gap-6 transition-all duration-300 ${isExpanded ? "sm:pl-64" : "sm:pl-14"
                    }`}
            >
                <div className="p-4 pb-20 w-full flex flex-col justify-start items-start">
                    <Welcome />
                    {/* {loading || formLoading ? <Skeleton className="min-w-80 w-full min-h-20" /> : null} */}

                    {/* <div className="w-full">
                        {!session?.user?.businessId && session?.user?.role.id !== 1 ?
                            <CreateBusinessForm /> : null
                        }
                        {forms && session?.user.role.id !== 1 ? (
                            <div className="px-4 py-6 border w-full mt-10 rounded-lg text-left shadow-md">
                                <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2> 
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
                    </div> */}
                </div>
                <Header breadcrumbs={mockData.breadcrumbs} user={mockData.user} />
                <Body
                    summaryCards={mockData.summaryCards}
                    recentOrders={mockData.recentOrders}
                    selectedOrder={mockData.selectedOrder}
                />
            </div>
        </div>
    );
}


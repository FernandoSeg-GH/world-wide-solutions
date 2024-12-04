'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppProvider';
import SectionHeader from "@/components/layout/navbar/SectionHeader";
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import AdminSubmissionCard from './submissions/AdminSubmissionCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import SubmissionsTable from './submissions/SubmissionTable';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const FormDetails = () => {
    const { data } = useAppContext();
    const { form, submissions } = data;
    const { data: session } = useSession();
    const router = useRouter();

    const [showTable, setShowTable] = useState(true);

    if (!form) {
        return <div>No form selected.</div>;
    }

    const isAdmin = session?.user.role.id === 4 || session?.user.role.id === 3;

    return (
        <div className={cn("flex flex-col gap-6 text-black dark:text-white min-h-[70vh] flex-grow w-full overflow-auto")}>
            <SectionHeader
                title={`Form: ${form.name}`}
                subtitle={
                    form.description
                        ? `Description: ${form.description}`
                        : 'Description: N/A'
                }
                buttons={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                router.push(
                                    `${window.location.origin}/builder/${encodeURIComponent(form.shareUrl)}`
                                )
                            }
                        >
                            Edit Form
                        </Button>
                        <Button
                            variant="default"
                            onClick={() =>
                                router.push(
                                    `${window.location.origin}/submit/${encodeURIComponent(form.shareUrl)}`
                                )
                            }
                        >
                            View Form
                        </Button>
                    </div>
                }
            />

            <div className="flex items-center">
                <span className="mr-2">Card View</span>
                <Switch
                    checked={showTable}
                    onCheckedChange={() => setShowTable(!showTable)}
                />
                <span className="ml-2">Table View</span>
            </div>

            {/* Table/Card view wrapper */}
            <div className="flex-grow overflow-auto h-full">
                {showTable ? (
                    <div className="overflow-x-auto w-full max-w-full"> {/* Scrollable on x-axis */}
                        <SubmissionsTable form={form} admin={isAdmin} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 w-full gap-4">
                        {submissions.map((submission) => (
                            <AdminSubmissionCard
                                key={submission.id}
                                submission={submission}
                                form={form}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormDetails;

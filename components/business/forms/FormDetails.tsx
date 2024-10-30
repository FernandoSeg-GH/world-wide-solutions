'use client';

import React from 'react';
import { useAppContext } from '@/context/AppProvider';
import SectionHeader from "@/components/layout/navbar/SectionHeader";
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import SubmissionCard from './submissions/SubmissionCard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import SubmissionsTable from './submissions/SubmissionTable';

const FormDetails = () => {
    const { data } = useAppContext();
    const { form, submissions } = data;
    const { data: session } = useSession();
    const router = useRouter();

    if (!form) {
        return <div>No form selected.</div>;
    }

    const isAdmin = session?.user.role.id === 4 || session?.user.role.id === 3;

    return (
        <div className="flex flex-col gap-6 text-black dark:text-white w-full">
            <div className="flex items-center justify-between">
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
                                        `${window.location.origin}/builder/${encodeURIComponent(
                                            form.shareUrl
                                        )}`
                                    )
                                }
                            >
                                Edit Form
                            </Button>
                            <Button
                                variant="default"
                                onClick={() =>
                                    router.push(
                                        `${window.location.origin}/submit/${encodeURIComponent(
                                            form.shareUrl
                                        )}`
                                    )
                                }
                            >
                                View Form
                            </Button>
                        </div>
                    }
                />
            </div>

            <Separator className="border-gray-400 my-2 mb-6" />

            <div className="w-full overflow-x-auto">
                <SubmissionsTable form={form} admin={isAdmin} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {submissions.map((submission) => (
                    <SubmissionCard
                        key={submission.id}
                        submission={submission}
                        form={form}
                    />
                ))}
            </div>
        </div>
    );
};

export default FormDetails;

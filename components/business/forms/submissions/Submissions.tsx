// src/components/Submissions.tsx

'use client';

import React, { useEffect } from 'react';
import Spinner from '@/components/ui/spinner';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import { useAppContext } from '@/context/AppProvider';
import SubmissionCard from './SubmissionCard';

type Props = {};

function Submissions({ }: Props) {
    const { data: session } = useSession();
    const { submissions, loading, currentPage, totalPages, fetchSubmissionsByFormUrl } = useSubmissions();
    const { data } = useAppContext();
    const { form } = data;

    if (loading) {
        return <Spinner />;
    }

    const handlePrevious = () => {
        if (currentPage > 1) { }
    };

    const handleNext = () => {
        if (currentPage < Number(totalPages)) { }
    };

    if (!form) return <p>No form found.</p>
    return (
        <div className="px-4 text-black dark:text-white w-full">
            <SectionHeader title="Submissions" subtitle="View form submissions." />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="mb-12 w-full">
                <div className='flex flex-col gap-4'>

                    {submissions.length > 0 ? (
                        submissions.map((submission) => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                                form={form}
                            />
                        ))
                    ) : (
                        <p>No submissions found</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Submissions;

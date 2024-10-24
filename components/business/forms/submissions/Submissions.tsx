'use client';

import React, { useEffect } from 'react';
import Spinner from '@/components/ui/spinner';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/navbar/SectionHeader';
import SubmissionCard from './SubmissionCard';

type Props = {};

function Submissions({ }: Props) {
    const { data: session } = useSession();
    const { submissions, loading, currentPage, totalPages, fetchSubmissionsByFormUrl } = useSubmissions();

    useEffect(() => {
        if (session?.user.businessId) {

            const shareUrls = ["patient-personal-information"];

            shareUrls.forEach((shareUrl) => {
                fetchSubmissionsByFormUrl(shareUrl)
                    .then(() => {
                        console.log(`Successfully fetched submissions for form: ${shareUrl}`);
                    })
                    .catch((error) => {
                        console.error(`Error fetching submissions for form: ${shareUrl}`, error);
                    });
            });
        }
    }, [session, fetchSubmissionsByFormUrl]);


    if (loading) {
        return <Spinner />;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {

            console.log("Handle previous page");
        }
    };

    const handleNext = () => {
        if (currentPage < Number(totalPages)) {

            console.log("Handle next page");
        }
    };

    return (
        <div className='px-4 text-black dark:text-white'>
            <SectionHeader
                title="Submissions"
                subtitle="View form submissions."
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="mb-12">
                {submissions.length > 0 ? (
                    submissions.map((submission) => {

                        let contentParsed: Record<string, any> = typeof submission.content === 'string'
                            ? JSON.parse(submission.content)
                            : submission.content;

                        return (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}

                                contentParsed={contentParsed}
                            />
                        );
                    })
                ) : (
                    <p>No submissions found</p>
                )}

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

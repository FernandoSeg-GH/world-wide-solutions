'use client';

import React, { useEffect } from 'react';
import Spinner from '@/components/ui/spinner';
import { useAppContext } from '@/context/AppProvider';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/SectionHeader';
import SubmissionCard from './SubmissionCard'; // Ensure correct path

type Props = {};

function Submissions({ }: Props) {
    const { data: session } = useSession();
    const { data, actions } = useAppContext();
    const { fetchSubmissionsByFormUrl } = useSubmissions();
    const {
        godMode,
        loading,
        businesses,
        forms,
        submissions,
        currentPage,
        totalPages,
    } = data;
    const {
        getAllBusinesses,
        fetchAllUsers,
        formActions: { fetchFormsByBusinessId },
        fetchAllSubmissions,
        fetchSubscriptionPlans,
    } = actions;

    // Fetch initial data based on user role
    useEffect(() => {
        if (godMode) {
            fetchAllSubmissions();
            getAllBusinesses();
            fetchAllUsers();
            fetchSubscriptionPlans();
        } else {
            const businessId = session?.user.businessId;
            if (businessId) {
                fetchFormsByBusinessId(businessId);
            }
        }
    }, [
        godMode,
        session?.user.businessId
    ]);

    // Fetch submissions for each form when forms are loaded
    useEffect(() => {
        if (!godMode && forms.length > 0 && session?.user.businessId) {
            forms.forEach((form) => {
                fetchSubmissionsByFormUrl(form.shareUrl, Number(session.user.businessId));
            });
        }
    }, [godMode, forms, fetchSubmissionsByFormUrl, session?.user.businessId]);

    // Debugging: Log submissions after fetching
    useEffect(() => {
        console.log("Submissions after fetching:", submissions);
    }, [submissions]);

    if (loading) {
        return <Spinner />;
    }

    const handlePrevious = () => {
        if (currentPage as number > 1) {
            actions.fetchAllSubmissions(currentPage as number - 1);
        }
    };

    const handleNext = () => {
        if (currentPage as number < Number(totalPages)) {
            actions.fetchAllSubmissions(currentPage as number + 1);
        }
    };

    return (
        <div className='px-4'>
            <SectionHeader
                title="Submissions"
                subtitle="View form submissions."
            />
            <Separator className="border-gray-400 my-2 mb-6" />
            <div className="mb-12">
                {/* Iterate over submissions and associate each with its respective form */}
                {submissions.map((submission) => {
                    // **1. Find the form associated with this submission**
                    const form = forms.find(f => f.id === submission.formId)

                    if (!form) {
                        // **2. Handle case where form is not found**
                        return (
                            <div key={submission.id} className="p-4 bg-red-100 text-red-700 rounded mb-4">
                                Form not found for submission ID {submission.id}.
                            </div>
                        );
                    }

                    // **3. Parse the content JSON**
                    let contentParsed: Record<string, any> = {};
                    try {
                        contentParsed = JSON.parse(String(submission.content));
                    } catch (error) {
                        console.error(`Error parsing submission content for submission ID ${submission.id}:`, error);
                        return (
                            <div key={submission.id} className="p-4 bg-red-100 text-red-700 rounded mb-4">
                                Error parsing content for submission ID {submission.id}.
                            </div>
                        );
                    }

                    return (
                        <SubmissionCard
                            key={submission.id}
                            submission={submission}
                            form={form}
                            contentParsed={contentParsed}
                        />
                    );
                })}
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
            </div>
        </div>
    );
}

export default Submissions;

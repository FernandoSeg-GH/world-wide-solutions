"use client";

import React, { useEffect } from 'react';
import SubmissionCards from './SubmissionsCards';
import Spinner from '@/components/ui/spinner';
import { useAppContext } from '@/context/AppProvider';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import SectionHeader from '@/components/layout/SectionHeader';

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
        fetchAllUsers,
        getAllBusinesses,
        fetchAllSubmissions,
        fetchSubscriptionPlans,
        fetchFormsByBusinessId,
        session?.user.businessId
    ]);

    useEffect(() => {
        if (!godMode && forms.length > 0 && session?.user.businessId) {
            forms.forEach((form) => {
                fetchSubmissionsByFormUrl(form.shareUrl, Number(session?.user.businessId));
            });
        }
    }, [godMode, forms, fetchSubmissionsByFormUrl, session?.user.businessId]);

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
                {/* Pass the forms and submissions correctly to the SubmissionCards */}
                {/* <SubmissionCards submissions={submissions} forms={forms} /> */}
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

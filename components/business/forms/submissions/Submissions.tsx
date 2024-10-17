"use client";
import React, { useEffect } from 'react';
import SubmissionFormCard from './SubmissionFormCard';
import SubmissionsTable from './SubmissionTable';
import Spinner from '@/components/ui/spinner';
import SubmissionCards from './SubmissionsCards';
import { useAppContext } from '@/context/AppProvider';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useSession } from 'next-auth/react';

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
            // Fetch everything in god mode
            fetchAllSubmissions();
            getAllBusinesses();
            fetchAllUsers();
            fetchSubscriptionPlans();
        }
        else {
            // Fetch forms by businessId when not in god mode
            const businessId = session?.user.businessId;
            if (businessId) {
                fetchFormsByBusinessId(businessId)
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
            // Fetch submissions for each form when not in god mode
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
        <div>
            <div className="mb-12">
                <SubmissionCards submissions={submissions} forms={forms} />
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

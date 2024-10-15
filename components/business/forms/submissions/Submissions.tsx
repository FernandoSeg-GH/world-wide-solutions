"use client"
import React, { useEffect } from 'react'
import SubmissionFormCard from './SubmissionFormCard';
import SubmissionsTable from './SubmissionTable';
import ClientView from '../ClientView';
import { useSession } from 'next-auth/react';
import { useGodMode } from '@/hooks/user/useGodMode';
import { useAppContext } from '@/context/AppProvider';
import Spinner from '@/components/ui/spinner';
import SubmissionCards from './SubmissionsCards';

type Props = {}

function Submissions({ }: Props) {
    const { data, actions } = useAppContext();
    const {
        godMode,
        loading,
        businesses,
        users,
        forms,
        submissions,
        subscriptionPlans,
        currentPage,
        totalPages,
        roles,
        tasks,
        messages,
        chats,
        aiCharacters,
        landingPages,
        socialMediaPosts,
    } = data;
    const {
        getAllBusinesses,
        fetchAllUsers,
        formActions: { fetchAllForms },
        fetchAllSubmissions,
        fetchSubscriptionPlans,
        // fetchAllRoles,
        // fetchAllTasks,
        // fetchAllMessages,
        // fetchAllChats,
        // fetchAllAICharacters,
        // fetchAllLandingPages,
        // fetchAllSocialMediaPosts,
    } = actions;

    useEffect(() => {
        if (godMode) {
            actions.fetchAllSubmissions();
            fetchAllForms();
            getAllBusinesses();
            fetchAllUsers();
            fetchSubscriptionPlans();
            // fetchAllRoles();
            // fetchAllTasks();
            // fetchAllMessages();
            // fetchAllChats();
            // fetchAllAICharacters();
            // fetchAllLandingPages();
            // fetchAllSocialMediaPosts();
        }
    }, [
        godMode,
        fetchAllUsers,
        getAllBusinesses,
        fetchAllForms,
        fetchAllSubmissions,
        fetchSubscriptionPlans,
        // fetchAllRoles,
        // fetchAllTasks,
        // fetchAllMessages,
        // fetchAllChats,
        // fetchAllAICharacters,
        // fetchAllLandingPages,
        // fetchAllSocialMediaPosts,
    ]);

    if (!godMode) {
        return null;
    }

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
            {/* <div className="w-full flex flex-col gap-6">
                {forms && forms.length > 0 ?
                    <SubmissionFormCard forms={forms} />

                    : <p>No Submissions Form Card Available.</p>}

                {forms && forms.length > 0 ?
                    forms.map((form, index) =>
                        <SubmissionsTable key={index} form={form} submissions={submissions} admin />
                    )

                    : <p> No SubmissionsTable Available.</p>}

                {forms ?
                    forms.map((form, index) =>
                        <ClientView key={index} form={form} submissions={submissions ?? []} />
                    )

                    : <p> No ClientView Available.</p>}

            </div> */}
        </div>
    )
}


export default Submissions
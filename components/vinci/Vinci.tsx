
"use client";

import React, { useEffect } from "react";
import { useAppContext } from "@/context/AppProvider";
import Spinner from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SubscriptionPlan } from "@/types";
import SubmissionCards from "../business/forms/submissions/SubmissionsCards";

function isStringArray(features: any): features is string[] {
    return Array.isArray(features) && features.every(item => typeof item === 'string');
}

function isString(features: any): features is string {
    return typeof features === 'string';
}

function isObject(features: any): features is Record<string, any> {
    return typeof features === 'object' && features !== null && !Array.isArray(features);
}

export default function Vinci() {
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
        <div className="p-4 rounded-lg shadow overflow-auto">
            <h1 className="text-3xl font-bold mb-6">Vinci Database Viewer</h1>

            {/* Users Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Users</h2>
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Business ID</TableHead>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Last Login At</TableHead>
                            <TableHead>Is Active</TableHead>
                            <TableHead>Onboarded</TableHead>
                            {/* Add other user fields as needed */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role_name || "N/A"}</TableCell>
                                <TableCell>{user.business_id || "N/A"}</TableCell>
                                <TableCell>{user.business_name || "N/A"}</TableCell>
                                <TableCell>
                                    {user.last_login_at
                                        ? new Date(user.last_login_at).toLocaleString()
                                        : "Never"}
                                </TableCell>
                                <TableCell>{user.is_active ? "Yes" : "No"}</TableCell>
                                <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
                                {/* Add other user fields as needed */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Roles Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Roles</h2>
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            {/* Add other role fields as needed */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>{role.id}</TableCell>
                                <TableCell>{role.name}</TableCell>
                                {/* Add other role fields as needed */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Businesses Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Businesses</h2>
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead>Subscription Plan</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>LinkedIn</TableHead>
                            <TableHead>Instagram</TableHead>
                            <TableHead>Facebook</TableHead>
                            <TableHead>Twitter</TableHead>
                            <TableHead>TikTok</TableHead>
                            <TableHead>YouTube</TableHead>
                            <TableHead>SEO Description</TableHead>
                            <TableHead>Business Email</TableHead>
                            <TableHead>Profile Image URL</TableHead>
                            <TableHead>Background Image URL</TableHead>
                            {/* Add other business fields as needed */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {businesses.map((business) => (
                            <TableRow key={business.id}>
                                <TableCell>{business.id}</TableCell>
                                <TableCell>{business.name}</TableCell>
                                <TableCell>{business.domain || "N/A"}</TableCell>
                                <TableCell>{business.subscription_plan_name || "N/A"}</TableCell>
                                <TableCell>{business.description || "N/A"}</TableCell>
                                <TableCell>{business.phone || "N/A"}</TableCell>
                                <TableCell>
                                    {business.url_linkedin ? (
                                        <a href={business.url_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            LinkedIn
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.url_instagram ? (
                                        <a href={business.url_instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500">
                                            Instagram
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.url_facebook ? (
                                        <a href={business.url_facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700">
                                            Facebook
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.url_twitter ? (
                                        <a href={business.url_twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                                            Twitter
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.url_tiktok ? (
                                        <a href={business.url_tiktok} target="_blank" rel="noopener noreferrer" className="text-black">
                                            TikTok
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.url_youtube ? (
                                        <a href={business.url_youtube} target="_blank" rel="noopener noreferrer" className="text-red-600">
                                            YouTube
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>{business.seo_description || "N/A"}</TableCell>
                                <TableCell>{business.business_email || "N/A"}</TableCell>
                                <TableCell>
                                    {business.profile_image_url ? (
                                        <a href={business.profile_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            View Image
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                <TableCell>
                                    {business.background_image_url ? (
                                        <a href={business.background_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            View Image
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell>
                                {/* Add other business fields as needed */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Forms Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Forms</h2>
                {forms && forms.length > 0 ? (
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Fields</TableHead>
                                <TableHead>Extra Attributes</TableHead>
                                <TableHead>Business ID</TableHead>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Landing Page ID</TableHead>
                                <TableHead>Landing Page URL</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Visits</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Share URL</TableHead>
                                {/* Add other form fields as needed */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forms?.map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>{form.id}</TableCell>
                                    <TableCell>{form.name}</TableCell>
                                    <TableCell>
                                        {/* Display fields as JSON string */}
                                        <pre className="whitespace-pre-wrap text-xs">
                                            {JSON.stringify(form.fields, null, 2)}
                                        </pre>
                                    </TableCell>
                                    <TableCell>
                                        {/* Display extra attributes as JSON string */}
                                        <pre className="whitespace-pre-wrap text-xs">
                                            {JSON.stringify(form.extraAttributes, null, 2)}
                                        </pre>
                                    </TableCell>
                                    <TableCell>{form.businessId}</TableCell>
                                    <TableCell>{form.business_name || "N/A"}</TableCell>
                                    <TableCell>{form.landing_page_id || "N/A"}</TableCell>
                                    <TableCell>
                                        {form.landing_page_url ? (
                                            <a href={form.landing_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                                Landing Page
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell>{form.description || "N/A"}</TableCell>
                                    <TableCell>{form.visits}</TableCell>
                                    <TableCell>{form.published ? "Yes" : "No"}</TableCell>
                                    <TableCell>
                                        {form.createdAt
                                            ? new Date(form.createdAt).toLocaleString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {form.shareUrl ? (
                                            <a href={`/forms/${form.shareUrl}`} target="_blank" rel="noopener noreferrer" className="text-green-500">
                                                {form.shareUrl}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    {/* Add other form fields as needed */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p>No forms available.</p>
                )}

            </div>

            {/* Submissions Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Submissions</h2>
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

            {/* Subscription Plans Table */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Features</TableHead>
                            {/* Add other subscription plan fields as needed */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptionPlans.map((plan: SubscriptionPlan) => (
                            <TableRow key={plan.id}>
                                <TableCell>{plan.id}</TableCell>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell>${plan.price}</TableCell>
                                {/* <TableCell>
                                    {isStringArray(plan.features) ? (
                                        <ul className="list-disc list-inside">
                                            {plan.features.map((feature, index) => (
                                                <li key={index}>{feature}</li>
                                            ))}
                                        </ul>
                                    ) : isString(plan.features) ? (
                                        <p>{plan.features}</p>
                                    ) : isObject(plan.features) ? (
                                        <pre className="whitespace-pre-wrap text-xs">
                                            {JSON.stringify(plan.features, null, 2)}
                                        </pre>
                                    ) : (
                                        "N/A"
                                    )}
                                </TableCell> */}
                                {/* Add other subscription plan fields as needed */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Additional Tables */}
            {/* You can add similar tables for Roles, Tasks, Messages, Chats, AI Characters, Landing Pages, Social Media Posts, etc., following the same pattern */}
        </div >
    );
}

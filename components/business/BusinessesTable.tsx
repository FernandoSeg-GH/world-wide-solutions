// components/business/BusinessesTable.tsx

'use client';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Business } from '@/types';
import { Button } from '@/components/ui/button';

export default function BusinessesTable() {
    const { data, actions } = useAppContext();
    const { businesses, loading, godMode } = data;
    const { getAllBusinesses, deleteBusiness } = actions;
    const router = useRouter();

    useEffect(() => {
        if (godMode) {
            getAllBusinesses();
        }
    }, [godMode, getAllBusinesses]);

    const handleEdit = (businessId: number) => {
        router.push(`/edit-business?businessId=${businessId}`);
    };

    const handleDelete = async (businessId: number) => {
        const confirmed = confirm("Are you sure you want to delete this business? This action cannot be undone.");
        if (confirmed) {
            const success = await deleteBusiness(businessId);
            if (success) {
                // Optionally refresh the businesses list
                getAllBusinesses();
            }
        }
    };

    if (!godMode) {
        return null;
    }

    if (loading) {
        return <p>Loading businesses...</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Businesses</h2>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Domain</th>
                        <th className="py-2 px-4 border-b">Subscription Plan</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.map((business: Business) => (
                        <tr key={business.id}>
                            <td className="py-2 px-4 border-b">{business.id}</td>
                            <td className="py-2 px-4 border-b">{business.name}</td>
                            <td className="py-2 px-4 border-b">{business.domain}</td>
                            <td className="py-2 px-4 border-b">{business.subscription_plan_name}</td>
                            <td className="py-2 px-4 border-b space-x-2">
                                <Button size="sm" onClick={() => handleEdit(business.id)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(business.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

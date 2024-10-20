'use client';

import React, { useEffect, useState, useCallback } from "react";
import SectionHeader from "@/components/layout/navbar/SectionHeader";
import { useAppContext } from "@/context/AppProvider";
import { useBusiness } from "@/hooks/business/useBusiness";
import { useUser } from "@/hooks/user/useUser";
import { useSession } from "next-auth/react";
import Spinner from "@/components/ui/spinner";
import UserForm from "@/components/users/UserForm";
import BusinessSelect from "@/components/users/BusinessSelect";
import UserTable from "@/components/users/UserTable";

const Users: React.FC = () => {
    const { data } = useAppContext();
    const { currentUser } = data;
    const { fetchAllUsers, createUser, users, loading: userLoading } = useUser();
    const { fetchAllBusinesses, businesses, loading: businessLoading } = useBusiness();
    const { data: session, status } = useSession();

    const [selectedBusiness, setSelectedBusiness] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchAllUsers();
            if (currentUser?.roleId === 4) {
                fetchAllBusinesses();
            }
        }
    }, [status, session?.user?.id, currentUser, fetchAllBusinesses, fetchAllUsers]);

    const handleBusinessChange = (businessId: number) => {
        setSelectedBusiness(businessId);
    };

    const handleUserCreated = useCallback(async () => {
        await fetchAllUsers();
    }, [fetchAllUsers]);

    if (userLoading || businessLoading) {
        return <Spinner />;
    }

    return (
        <div className="container text-black dark:text-white">
            <SectionHeader title="Users" subtitle="Manage and view your users." />

            <div className="card shadow-lg p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <UserForm
                    onSubmit={async (userData) => {
                        await createUser(userData);
                        handleUserCreated();
                    }}
                    businesses={businesses}
                    currentUserRole={Number(currentUser?.roleId)}
                />
            </div>

            <div className="card shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Users</h3>

                {currentUser?.roleId === 4 && (
                    <BusinessSelect
                        businesses={businesses}
                        selectedBusiness={selectedBusiness}
                        onBusinessChange={handleBusinessChange}
                    />
                )}

                <UserTable users={users} currentUserRole={Number(currentUser?.roleId)} selectedBusiness={selectedBusiness} />
            </div>
        </div>
    );
};

export default Users;

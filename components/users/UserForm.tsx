'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type UserFormProps = {
    onSubmit: (userData: { username: string; email: string; password: string; roleId: number; businessId?: number }) => Promise<void>;
    businesses: { id: number; name: string }[];
    currentUserRole: number;
};

const UserForm: React.FC<UserFormProps> = ({ onSubmit, businesses, currentUserRole }) => {
    const [newUser, setNewUser] = useState<{ username: string; email: string; password: string; roleId: number; businessId?: number }>({
        username: "",
        email: "",
        password: "",
        roleId: 1,
        businessId: undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit({
                ...newUser,
                businessId: currentUserRole === 3 ? newUser.businessId : newUser.businessId,
            });
            toast({
                title: "User Created",
                description: `Successfully created user: ${newUser.username}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating the user.",
                variant: "destructive",
            });
        }
    };

    return (
        <form onSubmit={handleCreateUser}>
            <div className="mb-4">
                <label className="block text-sm font-medium">Username</label>
                <input
                    type="text"
                    name="username"
                    className="mt-1 block w-full p-2 border rounded"
                    value={newUser.username}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input
                    type="email"
                    name="email"
                    className="mt-1 block w-full p-2 border rounded"
                    value={newUser.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Password</label>
                <input
                    type="password"
                    name="password"
                    className="mt-1 block w-full p-2 border rounded"
                    value={newUser.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium">Role</label>
                <select
                    name="roleId"
                    className="mt-1 block w-full p-2 border rounded"
                    value={newUser.roleId}
                    onChange={handleChange}
                >
                    <option value={1}>Regular User</option>
                    <option value={2}>Moderator</option>
                    <option value={3}>Business Admin</option>
                </select>
            </div>

            {currentUserRole === 4 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium">Business</label>
                    <select
                        name="businessId"
                        className="mt-1 block w-full p-2 border rounded"
                        value={newUser.businessId || ""}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a business</option>
                        {businesses.map((business) => (
                            <option key={business.id} value={business.id}>
                                {business.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <Button type="submit">Create User</Button>
        </form>
    );
};

export default UserForm;

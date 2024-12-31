"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn, formatDate } from "@/lib/utils";
import { User } from "@/types";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/user/useUser";

type UserTableProps = {
    users: User[];
    currentUserRole: number;
    selectedBusiness?: number;
};

const UserTable: React.FC<UserTableProps> = ({
    users: initialUsers,
    currentUserRole,
    selectedBusiness,
}) => {
    const [users, setUsers] = useState<User[]>(initialUsers); // State for users
    const [loadingUsers, setLoadingUsers] = useState<{ [key: number]: boolean }>({});

    const { fetchAllUsers } = useUser();
    const filteredUsers = users.filter((user) => {
        if (currentUserRole === 3) {
            return user.business_id === selectedBusiness;
        }
        return true;
    });

    const handleToggleUserStatus = async (userId: number, newStatus: boolean) => {
        setLoadingUsers((prev) => ({ ...prev, [userId]: true }));

        try {
            // Optimistic UI Update
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, is_active: newStatus } : user
                )
            );

            const response = await fetch(`/api/users/${userId}/activate`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update user status.");
            }

            toast({
                title: "Success",
                description: `User status updated to ${newStatus ? "Active" : "Inactive"}`,
            });
            fetchAllUsers()
        } catch (error) {
            console.error("Error updating user status:", error);

            // Revert Optimistic Update on Failure
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, is_active: !newStatus } : user
                )
            );

            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        } finally {
            setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
        }
    };

    return (
        <Table className="w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-left px-4 py-2">Username</TableHead>
                    <TableHead className="text-left px-4 py-2">Email</TableHead>
                    <TableHead className="text-center px-4 py-2">Role</TableHead>
                    <TableHead className="text-center px-4 py-2">Business</TableHead>
                    <TableHead className="text-center px-4 py-2">Last Login</TableHead>
                    <TableHead className="text-center px-4 py-2">Is Active</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow
                        key={user.id}
                        className="bg-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <TableCell className="px-4 py-2">{user.username}</TableCell>
                        <TableCell className="px-4 py-2">{user.email}</TableCell>
                        <TableCell className="text-center px-4 py-2">
                            <div
                                className={cn(
                                    "px-3 py-1 rounded-full w-16 text-center flex items-center justify-center text-sm mx-auto",
                                    user.role_name === "Admin"
                                        ? "bg-red-500 text-white"
                                        : user.role_name === "Manager"
                                            ? "bg-blue-500 text-white"
                                            : user.role_name === "User"
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-500 text-white"
                                )}
                            >
                                {user.role_name}
                            </div>
                        </TableCell>
                        <TableCell className="text-center px-4 py-2">{user.business_name}</TableCell>
                        <TableCell className="text-center px-4 py-2">
                            {formatDate(user.last_login_at)}
                        </TableCell>
                        <TableCell className="text-center px-4 py-2">
                            <Select
                                value={
                                    loadingUsers[user.id]
                                        ? "..."
                                        : user.is_active
                                            ? "yes"
                                            : "no"
                                }
                                onValueChange={(value) =>
                                    handleToggleUserStatus(user.id, value === "yes")
                                }
                                disabled={loadingUsers[user.id]}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "w-20 mx-auto",
                                        loadingUsers[user.id] && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loadingUsers[user.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    ) : (
                                        <SelectValue placeholder="Select status" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default UserTable;

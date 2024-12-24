"use client";

import React from "react";
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

type UserTableProps = {
    users: User[];
    currentUserRole: number;
    selectedBusiness?: number;
};

const UserTable: React.FC<UserTableProps> = ({
    users,
    currentUserRole,
    selectedBusiness,
}) => {
    const filteredUsers = users.filter((user) => {
        if (currentUserRole === 3) {
            return user.business_id === selectedBusiness;
        }
        return true;
    });

    const handleToggleUserStatus = async (userId: number, newStatus: boolean) => {
        try {
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
        } catch (error) {
            console.error("Error updating user status:", error);
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
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
                            <div className={cn("px-3 py-1 rounded-full w-16 text-center flex items-center justify-center text-sm",
                                user.role_name === "Admin" ? "bg-red-500 text-white" :
                                    user.role_name === "Manager" ? "bg-blue-500 text-white" :
                                        user.role_name === "User" ? "bg-green-500 text-white" :
                                            "bg-gray-500 text-white"
                            )}>
                                {user.role_name}
                            </div>
                        </TableCell>
                        <TableCell className="text-center px-4 py-2">{user.business_name}</TableCell>
                        <TableCell className="text-center px-4 py-2">
                            {formatDate(user.last_login_at)}
                        </TableCell>
                        <TableCell className="text-center px-4 py-2">
                            <Select
                                value={user.is_active ? "yes" : "no"}
                                onValueChange={(value) =>
                                    handleToggleUserStatus(user.id, value === "yes")
                                }
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder="Select status" />
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

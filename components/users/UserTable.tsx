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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";

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
            return user.businessId === selectedBusiness;
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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Is Active</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.roleName}</TableCell>
                        <TableCell>{user.businessName}</TableCell>
                        <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                        <TableCell>
                            <Select
                                value={user.isActive ? "yes" : "no"}
                                onValueChange={(value) =>
                                    handleToggleUserStatus(user.id, value === "yes")
                                }
                            >
                                <SelectTrigger>
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

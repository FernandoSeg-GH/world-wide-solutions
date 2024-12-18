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
import { formatDate } from "@/lib/utils";
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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="whitespace-nowrap text-left">Username</TableHead>
                    <TableHead className="whitespace-nowrap text-leftr">Email</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Role</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Business</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Last Login</TableHead>
                    <TableHead className="whitespace-nowrap text-center">Is Active</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="bg-gray-50 whitespace-nowrap">{user.username}</TableCell>
                        <TableCell className="bg-gray-50 whitespace-nowrap">{user.email}</TableCell>
                        <TableCell className="bg-gray-50 whitespace-nowrap text-center">{user.role_name}</TableCell>
                        <TableCell className="bg-gray-50 whitespace-nowrap text-center">{user.business_name}</TableCell>
                        <TableCell className="bg-gray-50 whitespace-nowrap text-right">{formatDate(user.last_login_at)}</TableCell>
                        <TableCell className="bg-gray-50 whitespace-nowrap text-center">
                            <Select
                                value={user.is_active ? "yes" : "no"}
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

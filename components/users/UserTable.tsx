import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/types";

type UserTableProps = {
    users: User[];
    currentUserRole: number;
    selectedBusiness?: number;
};

const UserTable: React.FC<UserTableProps> = ({ users, currentUserRole, selectedBusiness }) => {
    const filteredUsers = users.filter((user) => {
        if (currentUserRole === 3) {
            return user.businessId === selectedBusiness;
        }
        return true;
    });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Last Login</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.roleName}</TableCell>
                        <TableCell>{user.businessName}</TableCell>
                        <TableCell>{user.lastLoginAt}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default UserTable;

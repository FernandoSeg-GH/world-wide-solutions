import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

type UserFormProps = {
    onSubmit: (userData: { username: string; email: string; password: string; roleId: number; businessId?: number }) => Promise<void>;
    businesses: { id: number; name: string }[];
    currentUserRole: number;
};

const UserForm: React.FC<UserFormProps> = ({ onSubmit, businesses, currentUserRole }) => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: 1,
        businessId: session?.user.businessId
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        if (!session?.user.businessId) {
            toast({
                title: "Error",
                description: "Contact your admin.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                roleId: formData.roleId,
                businessId: session.user.businessId,
            };

            await onSubmit(payload);
            toast({
                title: "Success",
                description: "User created successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating the user.",
                variant: "destructive",
            });
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </div>

            <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                />
            </div>

            <div>
                <Label htmlFor="roleId">Role</Label>
                <Select
                    onValueChange={(value) => setFormData({ ...formData, roleId: Number(value) })}
                    value={String(formData.roleId)}
                >
                    <SelectTrigger id="roleId">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">User</SelectItem>
                        <SelectItem value="2">Manager</SelectItem>
                        <SelectItem value="3">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating User..." : "Create User"}
            </Button>
        </form>
    );
};

export default UserForm;

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function SignUp({ onToggle }: { onToggle: () => void }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: 1,
        businessId: "2",
    });

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

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role_id: 1,
                    businessId: 2,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Registration successful. You can now sign in.",
                });
                onToggle();
                router.push("/auth/sign-in");
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Registration failed.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast({
                title: "Error",
                description: "An error occurred during registration.",
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
                    onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    required
                />
            </div>
            {/* <div>
                <Label htmlFor="roleId">Role</Label>
                <select
                    id="roleId"
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md"
                    required
                >
                    <option value={2}>User</option>
                    <option value={1}>Admin</option>
                </select>
            </div>

            {formData.roleId === 1 && (
                <div>
                    <Label htmlFor="businessId">Business ID</Label>
                    <Input
                        id="businessId"
                        type="text"
                        value={formData.businessId}
                        onChange={(e) =>
                            setFormData({ ...formData, businessId: e.target.value })
                        }
                        required
                    />
                </div>
            )} */}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
            </Button>
            <Separator />
            <p className="text-sm text-center">
                Already have an account?{" "}
                <Button variant="link" onClick={onToggle}>
                    Sign In
                </Button>
            </p>
        </form>
    );
}

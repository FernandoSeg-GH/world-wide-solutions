// src/components/auth/SignIn.tsx

"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface SignInProps {
    onToggle: () => void;
    onForgotPassword: () => void; // Added this line
    callbackUrl: string;
}

export default function SignIn({ onToggle, onForgotPassword, callbackUrl }: SignInProps) {
    const [loading, setLoading] = useState(false);
    const [isRouting, setIsRouting] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                redirect: false,
                username: credentials.username,
                password: credentials.password,
                callbackUrl,
            });

            if (res?.error) {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive",
                });
                setLoading(false);
            } else {
                toast({
                    title: "Success",
                    description: "You have successfully signed in.",
                });
                setLoading(false);
                setIsRouting(true);
                router.push(callbackUrl);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
            console.error("SignIn error:", error);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    className="dark:text-black dark:border-gray-300"
                    value={credentials.username}
                    onChange={(e) =>
                        setCredentials({ ...credentials, username: e.target.value })
                    }
                    required
                />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    className="dark:text-black dark:border-gray-300"
                    value={credentials.password}
                    onChange={(e) =>
                        setCredentials({ ...credentials, password: e.target.value })
                    }
                    required
                />
            </div>
            <div className="flex items-center justify-between">
                <Button type="submit" disabled={loading || isRouting}>
                    {loading ? "Signing in..." : isRouting ? "Redirecting..." : "Sign In"}
                </Button>
                <Button variant="link" type="button" onClick={onForgotPassword}>
                    Forgot Password?
                </Button>
            </div>
            <Separator />
            {/* <p className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <Button variant="link" type="button" onClick={onToggle}>
                    Sign Up
                </Button>
            </p> */}
        </form>
    );
}

// components/auth/SignIn.tsx

"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface SignInProps {
    onToggle: () => void;
    callbackUrl: string;
}

export default function SignIn({ onToggle, callbackUrl }: SignInProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
            router.push(callbackUrl);
        }
    };

    // useEffect(() => {
    //     if (session?.user?.role?.id) {
    //         router.push("/dashboard");
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [session?.user?.role?.id]);

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
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Separator />
            <p className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <Button variant="link" onClick={onToggle}>
                    Sign Up
                </Button>
            </p>
        </form>
    );
}

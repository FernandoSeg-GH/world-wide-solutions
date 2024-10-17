
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function SignIn({ onToggle }: { onToggle: () => void }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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

    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.role?.id) {
            router.push("/dashboard");
        }
    }, [session?.user?.role?.id]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
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
                Don't have an account?{" "}
                <Button variant="link" onClick={onToggle}>
                    Sign Up
                </Button>
            </p>
        </form>
    );
}


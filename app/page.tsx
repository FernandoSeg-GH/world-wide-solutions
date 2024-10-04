
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function Home() {
    const [isRegistering, setIsRegistering] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    return (
        <div className="flex items-center justify-center min-h-screen w-screen p-4">
            <Card className="w-full max-w-md -mt-36">
                <CardHeader>
                    <CardTitle>{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegistering ? (
                        <SignUpForm onToggle={() => setIsRegistering(false)} />
                    ) : (
                        <SignInForm onToggle={() => setIsRegistering(true)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function SignInForm({ onToggle }: { onToggle: () => void }) {
    const [loading, setLoading] = useState(false);
    const [push, setPush] = useState(false);
    const router = useRouter();
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            username: credentials.username,
            password: credentials.password,
            redirect: true,
            callbackUrl: "/dashboard",
        });

        setLoading(false);

        if (res?.error) {
            toast({
                title: "Error",
                description: res.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "You have successfully signed in.",
            });
            setPush(!push)
            router.push('/dashboard')
        }
    };

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

function SignUpForm({ onToggle }: { onToggle: () => void }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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
                    role_id: 1
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Registration successful. You can now sign in.",
                });
                onToggle();
                router.push('/auth/sign-in')
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

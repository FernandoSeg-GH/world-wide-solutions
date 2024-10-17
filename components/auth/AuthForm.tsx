"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "./SignUp";
import SignIn from "./SignIn";

export function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen w-screen p-4">
            <Card className="w-full max-w-md -mt-36">
                <CardHeader>
                    <CardTitle>{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegistering ? (
                        <SignUp onToggle={() => setIsRegistering(false)} />
                    ) : (
                        <SignIn onToggle={() => setIsRegistering(true)} callbackUrl={"/dashboard"} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AuthForm
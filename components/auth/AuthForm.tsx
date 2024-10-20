"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Logo from "../Logo";

export function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen w-screen p-4 bg-muted dark:bg-muted-dark">
            <Card className="w-full max-w-md -mt-36 bg-white dark:bg-" >
                <Logo url="/assets/vws-hor.png" width={200} className="m-auto mt-6" />
                <CardHeader>
                    <CardTitle className="mx-auto text-lg">{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
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
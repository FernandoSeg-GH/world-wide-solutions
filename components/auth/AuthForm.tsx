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
            <Card className="w-full max-w-md -mt-36 bg-white" >
                <div className="w-full flex items-center justify-center">
                    <Logo
                        //  url="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/logo.avif" 
                        width={200}
                        className="m-auto mt-6"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="mx-auto text-lg">{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegistering ? (
                        <SignUp onToggle={() => setIsRegistering(false)} />
                    ) : (
                        <SignIn onToggle={() => setIsRegistering(true)} callbackUrl={"/"} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default AuthForm
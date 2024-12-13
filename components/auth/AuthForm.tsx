"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import Logo from "../Logo";

export function AuthForm() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const handleToggleToSignIn = () => {
        setIsRegistering(false);
        setIsForgotPassword(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen p-4 bg-muted dark:bg-muted-dark">
            <Card className="w-full max-w-md -mt-36 bg-white">
                <div className="w-full flex items-center justify-center">
                    <Logo
                        width={200}
                        className="m-auto mt-6"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="mx-auto text-lg">
                        {isRegistering ? "Sign Up" : isForgotPassword ? "Reset Password" : "Sign In"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isRegistering ? (
                        <SignUp onToggle={handleToggleToSignIn} />
                    ) : isForgotPassword ? (
                        <ForgotPassword onToggle={handleToggleToSignIn} />
                    ) : (
                        <SignIn
                            onToggle={() => setIsRegistering(true)}
                            onForgotPassword={() => setIsForgotPassword(true)} // Pass onForgotPassword
                            callbackUrl={"/"} // Adjust as needed
                        />
                    )}
                </CardContent>
                {!isForgotPassword && !isRegistering && (
                    <div className="mt-4 mb-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <button
                                className="text-primary underline hover:text-primary-dark"
                                onClick={() => setIsRegistering(true)}
                            >
                                Sign Up
                            </button>
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Forgot your password?
                            <button
                                className="ml-2 text-primary underline hover:text-primary-dark"
                                onClick={() => setIsForgotPassword(true)}
                            >
                                Reset Password
                            </button>
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default AuthForm;

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface ForgotPasswordProps {
    onToggle: () => void;
}

export default function ForgotPassword({ onToggle }: ForgotPasswordProps) {
    const [identifier, setIdentifier] = useState(""); // Username or Email
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [captchaToken, setCaptchaToken] = useState(""); // Store the CAPTCHA token
    const [userCaptchaInput, setUserCaptchaInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/generate_captcha`);
            if (!response.ok) {
                throw new Error("Failed to generate CAPTCHA");
            }

            const data = await response.json();

            setCaptchaQuestion(data.captcha_question); // Set CAPTCHA question
            setCaptchaToken(data.captcha_token); // Save the CAPTCHA token
        } catch (error) {
            console.error("Failed to generate CAPTCHA:", error);
            toast({ title: "Error", description: "Failed to load CAPTCHA.", variant: "destructive" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier || !newPassword || !confirmPassword || !userCaptchaInput) {
            toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
            return;
        }

        if (newPassword.length < 8) {
            toast({ title: "Error", description: "Password must be at least 8 characters long.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/auth/forgot_password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                    captcha_token: captchaToken, // Include the token
                    captcha_answer: userCaptchaInput, // Use user input for CAPTCHA
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({ title: "Success", description: data.message, variant: "default" });
                onToggle(); // Redirect or close modal
            } else {
                toast({ title: "Error", description: data.message || "Failed to reset password.", variant: "destructive" });
                generateCaptcha(); // Regenerate CAPTCHA
                setUserCaptchaInput("");
            }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            console.error("Forgot Password error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="identifier">Username or Email</Label>
                <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="captcha">{captchaQuestion}</Label>
                <Input
                    id="captcha"
                    type="number"
                    placeholder="Enter your answer"
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    required
                />
            </div>
            <div className="flex items-center justify-between">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <Button variant="link" type="button" onClick={onToggle}>
                    Back to Sign In
                </Button>
            </div>
        </form>
    );
}
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
    const [identifier, setIdentifier] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [captchaQuestion, setCaptchaQuestion] = useState("");
    const [expectedAnswer, setExpectedAnswer] = useState("");
    const [userCaptchaInput, setUserCaptchaInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = Math.random() > 0.5 ? "+" : "-";

        const question = operator === "+"
            ? `What is ${num1} + ${num2}?`
            : `What is ${num1} - ${num2}?`;

        const answer = operator === "+" ? num1 + num2 : num1 - num2;

        setCaptchaQuestion(question);
        setExpectedAnswer(answer.toString());
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


        if (userCaptchaInput.trim() !== expectedAnswer) {
            toast({ title: "Error", description: "Incorrect CAPTCHA answer.", variant: "destructive" });
            generateCaptcha();
            setUserCaptchaInput("");
            return;
        }

        const payload = {
            identifier: identifier.trim(),
            new_password: newPassword.trim(),
            confirm_password: confirmPassword.trim(),
        };

        setIsLoading(true);

        try {
            const response = await fetch(`/api/auth/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast({ title: "Success", description: data.message, variant: "default" });
                onToggle();
            } else {
                toast({ title: "Error", description: data.message || "Failed to reset password.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Forgot Password error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
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
                <p className="text-xs text-muted-foreground italic">Username is case sensitive.</p>
            </div>

            <div>
                <Label htmlFor="new_password">New Password</Label>
                <p className="text-sm text-gray-600">Must be at least 8 characters long.</p>
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
                    type="text"
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

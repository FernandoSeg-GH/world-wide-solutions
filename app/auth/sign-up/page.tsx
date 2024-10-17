
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "@/components/auth/SignUp";

export default function AuthSignUpPage() {
  const [isRegistering, setIsRegistering] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen w-screen p-4">
      <Card className="w-full max-w-md -mt-36">
        <CardHeader>
          <CardTitle>{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
        </CardHeader>
        <CardContent>

          <SignUp onToggle={() => setIsRegistering(false)} />

        </CardContent>
      </Card>
    </div>
  );
}

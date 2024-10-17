
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "@/components/auth/SignUp";
import SignIn from "@/components/auth/SignIn";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  // const { data: session } = useSession()
  // const router = useRouter()
  // useEffect(() => {
  //   if (session?.user.role.id) {
  //     router.push("/dashboard")
  //   }
  // }, [session?.user.role.id])

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
            <SignIn onToggle={() => setIsRegistering(true)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}



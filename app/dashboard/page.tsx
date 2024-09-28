'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import CreateFormBtn from "@/components/forms/CreateFormButton";
import FormCards from "@/components/forms/FormCards";
import Welcome from "@/components/user/Welcome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading) {
    return <Skeleton className="min-w-80 min-h-20" />;
  }

  return (
    <div className="container pt-4">
      <Welcome />
      <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
        <div className="w-full">
          <CreateFormBtn />
        </div>
        {session
          ? <FormCards />
          : null}
      </div>
    </div>
  );
}

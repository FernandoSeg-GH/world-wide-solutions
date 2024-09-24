import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import CreateFormBtn from "@/components/CreateFormButton";
import FormCards from "@/components/forms/FormCards";
import { useSession } from "next-auth/react";
import Welcome from "@/components/user/Welcome";

export default function Home() {
  return (
    <div className="container pt-4">
      <Welcome />
      {/* <Suspense fallback={<StatsCards loading={true} />}>
        <CardStatsWrapper />
      </Suspense> 
      <Separator className="my-6" />
      <Separator className="my-6" />
      */}
      <h2 className="text-2xl font-semibold col-span-2 mb-2">Your forms</h2>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
        {/* Box for CreateFormBtn */}
        <div className="w-full">
          <CreateFormBtn />
        </div>

        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          <FormCards />
        </Suspense>
      </div>
    </div>
  );
}


function FormCardSkeleton() {
  return <Skeleton className="border-2 border-primary-/20 h-[244px] w-full" />;
}

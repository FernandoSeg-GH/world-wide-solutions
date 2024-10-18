"use client";
import { cn, getLogoForDomain } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, use } from "react";
import BaseImage from "./BaseImage";
import { getBlurData } from "@/lib/getBlurData";
import Image from "next/image";
import { useAppContext } from "@/context/AppProvider";

type LogoProps = {
  isExpanded: boolean;
};

function Logo({ isExpanded }: LogoProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState<string>("Vinci Suite");
  const { data: currentBusiness } = useAppContext()

  useEffect(() => {
    if (currentBusiness.businesses[0]) {
      setTitle(currentBusiness.businesses[0].name)
    }
  }, [currentBusiness.businesses])

  return (
    <div className={cn(
      "w-full h-auto flex flex-col ",
      isExpanded ? "justify-start items-start py-2" : "justify-center items-center mt-2")}
    >
      {isExpanded && session?.user.businessId && <Image
        width={50}
        height={50}
        // blurData={blurData}
        src={`/assets/${getLogoForDomain(session?.user.businessId)}`}
        alt={title}
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
        className="object-cover rounded-t-xl"
      />}
      <div className={cn(
        "w-full h-auto flex flex-col ",
        isExpanded ? "justify-start items-start py-2" : "justify-center items-center mt-2")}
      >
        {!isExpanded && session?.user.businessId && <Image
          width={25}
          height={25}
          // blurData={blurData}
          src={`/assets/${getLogoForDomain(session?.user.businessId)}`}
          alt={title}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
          className="object-cover rounded-t-xl mb-2"
        />}
        <div className="flex items-center">
          <h1

            className={cn(
              "text-auto font-semibold whitespace-wrap hidden cursor-pointer",
              isExpanded && "block"
            )}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Logo;

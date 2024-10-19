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
import { useBusiness } from "@/hooks/business/useBusiness";

type LogoProps = {};

function Logo({ }: LogoProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState<string>("");
  const { data } = useAppContext()
  const { isExpanded, business } = data


  const { fetchBusinessById } = useBusiness()


  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (business?.name) {
      setTitle(business?.name)
    } else {
      setTitle("Vinci Suite")
    }
  }, [business])

  return (
    <div className={cn(
      isExpanded && "w-full h-auto flex flex-col items-start justify-start",
      // isMobile && "flex-row"
    )}
    >
      {isExpanded && session?.user.businessId &&
        <Image
          width={50}
          height={50}
          // blurData={blurData}
          src={`/assets/${getLogoForDomain(session?.user.businessId)}`}
          alt={title}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
          className="object-cover rounded-t-xl"
        />
      }
      <h1
        className={cn(
          "text-left font-semibold whitespace-wrap hidden cursor-pointer mt-1",
          isExpanded && "block",

        )}
      >
        {title}
      </h1>
    </div>
  );
}

export default Logo;

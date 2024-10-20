"use client";
import { cn, getLogoForDomain } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppProvider";

type LogoProps = {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  horizontal?: boolean;
  url?: string
};

function Logo({ onClick, horizontal, url }: LogoProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState<string>("");
  const { data } = useAppContext();
  const { isExpanded, currentUser } = data;

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
    if (currentUser?.businessName) {
      setTitle(currentUser.businessName);
    } else {
      setTitle("Vinci Suite");
    }
  }, [currentUser]);

  const logoSrc = `/assets/${getLogoForDomain(session?.user?.businessId!)}`;
  const logoSrcDark = logoSrc.replace(".png", "-dark.png");

  return (
    <div
      className={cn(
        "w-auto h-auto flex flex-col items-start justify-start p-4",
      )}
    >
      {session?.user.businessId && (
        <>
          {/* Light Mode Logo */}
          <Image
            width={isExpanded ? 50 : 25}
            height={isExpanded ? 50 : 25}
            src={url ? url : horizontal ? "/assets/logo-hor.png" : logoSrc}
            alt={title}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            className={cn("block dark:hidden", isExpanded && "w-24 h-24")}
          />

          {/* Dark Mode Logo */}
          <Image
            width={isExpanded ? 50 : 25}
            height={isExpanded ? 50 : 25}
            src={url ? url : horizontal ? "/assets/logo-hor.png" : logoSrcDark}
            alt={title}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
            className={cn("hidden dark:block", isExpanded && "w-24 h-24")}
          />
        </>
      )}
      <h1
        className={cn(
          "text-left font-semibold whitespace-wrap hidden cursor-pointer mt-1",
          isExpanded && "block"
        )}
      >
        {title}
      </h1>
    </div>
  );
}

export default Logo;

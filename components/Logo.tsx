"use client";

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppProvider";

type LogoProps = {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  horizontal?: boolean;
  url?: string;
  width: number; // Width is mandatory to control size
  className?: string;
};

function Logo({ onClick, horizontal, url, width, className = "" }: LogoProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState<string>("Vinci Suite"); // Default title
  const { data } = useAppContext();
  const { isExpanded, currentUser } = data;
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    const handleDarkModeToggle = () => {
      const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(darkMode);
    };

    handleResize();
    handleDarkModeToggle();

    window.addEventListener("resize", handleResize);
    window.addEventListener("change", handleDarkModeToggle); // Update on dark mode change

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("change", handleDarkModeToggle);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.businessName) {
      setTitle(currentUser.businessName);
    }
  }, [currentUser]);

  // Decide logo source based on the conditions
  const getLogoSrc = () => {
    if (url) return url; // Custom logo URL takes priority
    return isDarkMode ? "/assets/vws-dark.png" : "/assets/vws.png";
  };

  const logoSrc = getLogoSrc();

  return (
    <div
      onClick={onClick}
      className={cn("w-auto h-auto max-h-[57px] flex flex-col items-start justify-start p-4", className)}
      style={{ transition: "all 0.3s ease" }} // Smooth transition for container changes
    >
      {/* Display logo based on the dark mode/light mode */}
      <div
        style={{
          width: `${width}px`, // Set width dynamically
          height: `${width}px`, // Set height dynamically to match width
          transition: "width 0.3s ease, height 0.3s ease", // Smooth transition for the logo size
        }}
      >
        <Image
          layout="fixed" // Prevent layout shift during size changes
          width={width} // Apply dynamic width
          height={width} // Apply dynamic height (matching the width)
          src={logoSrc}
          alt={title}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 30vw"
        />
      </div>

      {/* Render the title if the sidebar is expanded */}
      <h1
        className={cn(
          "text-left font-semibold whitespace-wrap cursor-pointer mt-1",
          isExpanded ? "block" : "hidden"
        )}
        style={{ transition: "opacity 0.3s ease" }} // Smooth transition for the title appearance
      >
        {title}
      </h1>
    </div>
  );
}

export default Logo;

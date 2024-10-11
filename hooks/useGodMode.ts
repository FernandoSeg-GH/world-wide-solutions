"use client";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";

export const useGodMode = () => {
  const [godMode, setGodMode] = useState<boolean>(true);

  const toggleGodMode = useCallback(() => {
    setGodMode((prev) => !prev);
    toast({
      title: godMode ? "God Mode Disabled" : "God Mode Enabled",
      description: godMode
        ? "You are now in normal mode."
        : "You have special privileges now.",
    });
  }, [godMode]);

  useEffect(() => {
    let keySequence: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      keySequence.push(key.toUpperCase());

      if (keySequence.length > 3) {
        keySequence.shift();
      }

      if (keySequence.join("") === "GOD") {
        toggleGodMode();
        keySequence = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleGodMode]);

  return {
    godMode,
    toggleGodMode,
  };
};

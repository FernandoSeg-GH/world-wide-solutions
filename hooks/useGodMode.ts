"use client";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";

export const useGodMode = () => {
  const [godMode, setGodMode] = useState<boolean>(false);

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

      // Check if key is defined before using toUpperCase
      if (!key) return;

      keySequence.push(key.toUpperCase());

      // Limit the sequence to a max of 4 characters
      if (keySequence.length > 4) {
        keySequence.shift();
      }

      if (keySequence.join("") === "GOD") {
        toggleGodMode();
        keySequence = []; // Reset the sequence after toggling
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

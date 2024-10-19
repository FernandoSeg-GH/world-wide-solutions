"use client";

import { useState, useCallback } from "react";

interface UseLayoutReturn {
  currentSection: string;
  switchSection: (section: string) => void;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useLayout = (): UseLayoutReturn => {
  const [currentSection, setCurrentSection] = useState<string>("Dashboard");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const switchSection = useCallback(
    (section: string) => {
      setCurrentSection(section);
    },
    [currentSection]
  );

  return {
    currentSection,
    switchSection,
    isExpanded,
    setIsExpanded,
  };
};

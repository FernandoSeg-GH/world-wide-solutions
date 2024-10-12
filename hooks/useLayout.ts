// hooks/useLayout.ts

import { useState, useCallback } from "react";

export const useLayout = () => {
  const [currentSection, setCurrentSection] = useState<string>("Dashboard");

  const switchSection = useCallback((section: string) => {
    setCurrentSection(section);
  }, []);

  return {
    currentSection,
    switchSection,
  };
};

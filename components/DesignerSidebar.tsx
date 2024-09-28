import React from "react";
import { useAppContext } from "./context/AppContext"; // Importing AppContext
import FormElementsSidebar from "./FormElementsSidebar";
import PropertiesFormSidebar from "./PropertiesFormSidebar";

function DesignerSidebar() {
  const { data: { selectedElement } } = useAppContext(); // Use AppContext to get the selected element

  return (
    <aside className="w-[400px] max-w-[400px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
      {!selectedElement && <FormElementsSidebar />} {/* Show FormElementsSidebar when no element is selected */}
      {selectedElement && <PropertiesFormSidebar />} {/* Show PropertiesFormSidebar when an element is selected */}
    </aside>
  );
}

export default DesignerSidebar;

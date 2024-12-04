import React from "react";
import { useAppContext } from "@/context/AppProvider";

import PropertiesFormSidebar from "@/components/builder/PropertiesFormSidebar";
import FormElementsSidebar from "@/components/business/forms/FormElementsSidebar";

function DesignerSidebar() {
  const { data: { selectedElement } } = useAppContext();

  return (
    <aside className="w-[400px] max-w-[380px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
      {!selectedElement && <FormElementsSidebar />}
      {selectedElement && <PropertiesFormSidebar />}
    </aside>
  );
}

export default DesignerSidebar;

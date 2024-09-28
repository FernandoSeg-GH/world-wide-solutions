import React from "react";
import { FormElements } from "./forms/FormElements";
import { AiOutlineClose } from "react-icons/ai";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useAppContext } from "./context/AppContext";

function PropertiesFormSidebar() {
    const {
        data: { selectedElement },
        selectors: { setSelectedElement },
    } = useAppContext();

    if (!selectedElement) return null;

    const PropertiesForm = FormElements[selectedElement?.type].propertiesComponent;

    return (
        <div className="flex flex-col p-2">
            <div className="flex justify-between items-center">
                <p className="text-sm text-foreground/70">Element properties</p>
                <Button
                    size={"icon"}
                    variant={"ghost"}
                    onClick={() => {
                        setSelectedElement(null);
                    }}
                >
                    <AiOutlineClose />
                </Button>
            </div>
            <Separator className="mb-4" />
            <PropertiesForm elementInstance={selectedElement} />
        </div>
    );
}

export default PropertiesFormSidebar;

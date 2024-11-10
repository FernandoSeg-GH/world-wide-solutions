"use client";

import { FC, ReactNode } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";

interface AccordionPanelProps {
    children: ReactNode;
}

const AccordionPanel: FC<AccordionPanelProps> = ({ children }) => {
    return (
        <RadixAccordion.Content className="mt-2 p-4 border-t">
            {children}
        </RadixAccordion.Content>
    );
};

export default AccordionPanel;

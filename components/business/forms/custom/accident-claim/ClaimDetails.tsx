// components/ClaimDetails.tsx
import React from "react";
import { FaEdit } from "react-icons/fa";
import { formSections } from "./formConfig";
import { Button } from "@/components/ui/button";
import { EditableClaim } from "./AccidentClaimsView";
import { AccidentClaimFormData } from "../accident-claim-form";

interface ClaimDetailsProps {
    claim: EditableClaim;
    onEdit: (claim_id: string) => void;
}

export function getNestedValue(obj: any, path: string[]): any {
    return path.reduce((acc, key) => (acc && acc[key] ? acc[key] : null), obj);
}

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claim, onEdit }) => {
    return (
        <div>
            {/* Iterate over formSections to display data */}
            {formSections.map((section) => (
                <section key={section.title} className="mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {section.icon}
                        {section.title}
                    </h2>
                    <div className="space-y-2">
                        {section.fields.map((field) => {
                            const path = field.nestedSection ? [field.nestedSection, field.id] : [field.id];
                            const value = getNestedValue(claim.editedData, path);
                            return (
                                <div key={field.id}>
                                    <span className="font-medium">{field.label}: </span>
                                    <span>{value}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

        </div>
    );
};

export default ClaimDetails;

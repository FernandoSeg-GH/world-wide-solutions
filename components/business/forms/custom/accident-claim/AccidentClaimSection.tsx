// components/AccidentClaimSection.tsx
import React from "react";
import { FieldConfig, SectionConfig } from "./formConfig";
import GenericField from "./GenericField";

interface AccidentClaimSectionProps {
    section: SectionConfig;
    data: any;
    onFieldChange: (fieldId: string, value: any) => void;
}

const AccidentClaimSection: React.FC<AccidentClaimSectionProps> = ({ section, data, onFieldChange }) => {
    const handleNestedChange = (field: FieldConfig, value: any) => {
        if (field.nestedSection) {
            onFieldChange(`${field.nestedSection}.${field.id}`, value);
        } else {
            onFieldChange(field.id, value);
        }
    };

    const getFieldValue = (field: FieldConfig) => {
        if (field.nestedSection) {
            return data[field.nestedSection]?.[field.id] || "";
        }
        return data[field.id];
    };

    return (
        <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                {section.icon}
                {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                    <GenericField
                        key={field.id}
                        field={field}
                        value={getFieldValue(field)}
                        onChange={(value) => handleNestedChange(field, value)}
                    />
                ))}
            </div>
        </section>
    );
};

export default AccidentClaimSection;

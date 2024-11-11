// components/GenericField.tsx
import React from "react";
import { FieldConfig } from "./config/form-config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import FileUploadField from "./FileUploadField";

interface GenericFieldProps {
    field: FieldConfig;
    value: any;
    onChange: (value: any) => void;
}

const GenericField: React.FC<GenericFieldProps> = ({ field, value, onChange }) => {
    const renderField = () => {
        switch (field.type) {
            case "text":
            case "email":
            case "date":
            case "number":
                return (
                    <Input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                    />
                );
            case "textarea":
                return (
                    <Textarea
                        id={field.id}
                        name={field.id}
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                    />
                );
            case "select":
                return (
                    <Select
                        value={value || ""}
                        onValueChange={(val) => onChange(val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px] overflow-y-auto">
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case "conditionalSelect":
                // Example: Conditional rendering based on country
                return (
                    // Implement conditional select logic here
                    <Input
                        id={field.id}
                        name={field.id}
                        type="text"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                    />
                );
            case "file":
                return (
                    <FileUploadField
                        id={field.id}
                        label={field.label}
                        files={value}
                        onChange={onChange}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <Label htmlFor={field.id}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {renderField()}
        </div>
    );
};

export default GenericField;

"use client";
import { useState, useMemo } from "react";
import { Form, ElementsType } from "@/types";

// Hook to map fields from form to submission values
export function useFieldMapping(
  form: Form,
  submission: { [key: string]: any } = {}
) {
  const [fieldValues, setFieldValues] = useState<{ [key: string]: any }>({
    ...submission,
  });

  const isInputField = (fieldType: ElementsType): boolean => {
    const inputFieldTypes: ElementsType[] = [
      "TextField",
      "NumberField",
      "TextAreaField",
      "DateField",
      "SelectField",
      "TelephoneField",
      "CheckboxField",
      "FileUploadField",
    ];
    return inputFieldTypes.includes(fieldType);
  };

  const fields = Array.isArray(form.fields) ? form.fields : [];

  const fieldKeys: string[] = [];
  const fieldMap = useMemo(() => {
    const map: {
      [key: string]: {
        label: string;
        type: ElementsType;
        value: any; // Ensure this is fetched correctly
        extraAttributes?: any;
      };
    } = {};

    fields.forEach((field) => {
      if (isInputField(field.type)) {
        const fieldId = field.id.toString(); // Ensure consistency as a string
        const fieldValue = submission[fieldId] ?? "N/A"; // Correctly fetch value from submission
        map[fieldId] = {
          label: field.extraAttributes?.label || `Field ${fieldId}`,
          type: field.type,
          value: fieldValue, // Use the submission value directly
          extraAttributes: field.extraAttributes,
        };
        fieldKeys.push(fieldId);
      }
    });

    return map;
  }, [fields, submission]);

  return { fieldKeys, fieldMap, fieldValues, setFieldValues };
}

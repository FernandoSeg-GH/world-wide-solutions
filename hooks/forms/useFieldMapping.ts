// src/utils/useFieldMapping.ts

import { Form, ElementsType } from "@/types";

/**
 * Utility function to map form fields to fieldKeys and fieldMap.
 * @param form - The form object containing fields.
 * @returns An object containing ordered fieldKeys and fieldMap.
 */
export function useFieldMapping(form: Form) {
  const isInputField = (fieldType: ElementsType): boolean => {
    const inputFieldTypes: ElementsType[] = [
      "TextField",
      "NumberField",
      "TextAreaField",
      "DateField",
      "SelectField",
      "TelephoneField",
      "CheckboxField",
    ];
    return inputFieldTypes.includes(fieldType);
  };

  const fields = Array.isArray(form.fields) ? form.fields : [];

  const fieldKeys: string[] = [];
  const fieldMap: {
    [key: string]: { label: string; type: ElementsType; extraAttributes?: any };
  } = {};

  fields.forEach((field) => {
    if (isInputField(field.type)) {
      fieldMap[field.id] = {
        label: field.extraAttributes?.label || `Field ${field.id}`,
        type: field.type,
        extraAttributes: field.extraAttributes,
      };
      fieldKeys.push(field.id); // Maintain the order
    }
  });

  return { fieldKeys, fieldMap };
}

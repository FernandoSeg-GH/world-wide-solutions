import { useState } from "react";
import { Form, ElementsType } from "@/types";

// Assuming "submission" is an object with field IDs as keys and their values as values
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
  const fieldMap: {
    [key: string]: {
      label: string;
      type: ElementsType;
      value?: any;
      extraAttributes?: any;
    };
  } = {};

  fields.forEach((field) => {
    if (isInputField(field.type)) {
      const fieldValue = submission[field.id] || ""; // Retrieve the submission value if it exists
      fieldMap[field.id] = {
        label: field.extraAttributes?.label || `Field ${field.id}`,
        type: field.type,
        value: fieldValue, // Store the submission value in fieldMap
        extraAttributes: field.extraAttributes,
      };
      fieldKeys.push(field.id);
    }
  });

  const handleChange = (fieldId: string, value: any) => {
    setFieldValues((prevValues) => ({
      ...prevValues,
      [fieldId]: value,
    }));
  };

  return { fieldKeys, fieldMap, fieldValues, handleChange };
}

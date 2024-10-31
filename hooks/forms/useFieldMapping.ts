import { Form, ElementsType, FormField } from "@/types";

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
      "FileUploadField",
    ];
    return inputFieldTypes.includes(fieldType);
  };

  const fields = Array.isArray(form.fields) ? form.fields : [];

  const fieldKeys: string[] = [];
  const fieldMap: { [key: string]: FormField } = {};

  fields.forEach((field) => {
    if (isInputField(field.type)) {
      fieldMap[field.id] = {
        id: field.id, // add this line
        label: field.extraAttributes?.label || `Field ${field.id}`,
        type: field.type,
        extraAttributes: field.extraAttributes,
      };
      fieldKeys.push(field.id);
    }
  });

  return { fieldKeys, fieldMap };
}

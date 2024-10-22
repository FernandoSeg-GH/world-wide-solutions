import { CheckboxFieldFormElement } from "@/components/business/forms/fields/CheckboxField";
import { DateFieldFormElement } from "@/components/business/forms/fields/DateField";
import { NumberFieldFormElement } from "@/components/business/forms/fields/NumberField";
import { ParagraphFieldFormElement } from "@/components/business/forms/fields/ParagraphField";
import { SelectFieldFormElement } from "@/components/business/forms/fields/SelectField";
import { SeparatorFieldFormElement } from "@/components/business/forms/fields/SeparatorField";
import { SpacerFieldFormElement } from "@/components/business/forms/fields/SpacerField";
import { SubTitleFieldFormElement } from "@/components/business/forms/fields/SubTitleField";
import { TextAreaFormElement } from "@/components/business/forms/fields/TextAreaField";
import { TextFieldFormElement } from "@/components/business/forms/fields/TextField";
import { TitleFieldFormElement } from "@/components/business/forms/fields/TitleField";
import { TelephoneFieldFormElement } from "@/components/business/forms/fields/TelephoneField";
import { FormField } from "@/types";

export type ElementsType =
    | "TextField"
    | "TitleField"
    | "SubTitleField"
    | "ParagraphField"
    | "SeparatorField"
    | "SpacerField"
    | "NumberField"
    | "TextAreaField"
    | "DateField"
    | "SelectField"
    | "TelephoneField"
    | "CheckboxField";

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
    type: ElementsType;

    construct: (id: string) => FormElementInstance;

    designerBtnElement: {
        icon: React.ElementType;
        label: string;
    };

    designerComponent: React.FC<{
        elementInstance: FormElementInstance;
    }>;
    formComponent: React.FC<{
        elementInstance: FormElementInstance;
        submitValue?: SubmitFunction;
        isInvalid?: boolean;
        defaultValue?: string;
    }>;
    propertiesComponent: React.FC<{
        elementInstance: FormElementInstance;
    }>;

    validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};


export type FormElementInstance = FormField;

type FormElementsType = {
    [key in ElementsType]: FormElement;
};
export const FormElements: FormElementsType = {
    TextField: TextFieldFormElement,
    TitleField: TitleFieldFormElement,
    SubTitleField: SubTitleFieldFormElement,
    ParagraphField: ParagraphFieldFormElement,
    SeparatorField: SeparatorFieldFormElement,
    SpacerField: SpacerFieldFormElement,
    NumberField: NumberFieldFormElement,
    TextAreaField: TextAreaFormElement,
    DateField: DateFieldFormElement,
    SelectField: SelectFieldFormElement,
    CheckboxField: CheckboxFieldFormElement,
    TelephoneField: TelephoneFieldFormElement,
};
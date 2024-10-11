import { CheckboxFieldFormElement } from "@/components/fields/CheckboxField";
import { DateFieldFormElement } from "@/components/fields/DateField";
import { NumberFieldFormElement } from "@/components/fields/NumberField";
import { ParagraphFieldFormElement } from "@/components/fields/ParagraphField";
import { SelectFieldFormElement } from "@/components/fields/SelectField";
import { SeparatorFieldFormElement } from "@/components/fields/SeparatorField";
import { SpacerFieldFormElement } from "@/components/fields/SpacerField";
import { SubTitleFieldFormElement } from "@/components/fields/SubTitleField";
import { TextAreaFormElement } from "@/components/fields/TextAreaField";
import { TextFieldFormElement } from "@/components/fields/TextField";
import { TitleFieldFormElement } from "@/components/fields/TitleField";
import { TelephoneFieldFormElement } from "@/components/fields/TelephoneField";
import { Dispatch, SetStateAction } from "react";

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  features: string[] | null;
}

export interface Form {
  id: number;
  name: string;
  fields: FormElementInstance[];
  shareURL: string;
  businessId?: number;
  description?: string;
  extraAttributes?: Record<string, any>;
  createdAt?: string;
  published?: boolean;
  visits?: number;
  submissionsCount?: number;
  FormSubmissions?: Submission[];
}

export interface FormField {
  id: string;
  type: ElementsType;
  label?: string;
  required?: boolean;
  extraAttributes: {
    label?: string;
    required?: boolean;
    placeHolder?: string;
    helperText?: string;
    options?: { label: string; value: string }[];
    rows?: number;
    [key: string]: any;
  };
}

export interface FormContextType {
  formName: string;
  elements: FormField[];
  setElements: (elements: FormField[]) => void;
  setFormName: (name: string) => void;
  unsavedChanges: boolean;
  saveForm: () => Promise<void>;
  publishForm: (action: "publish" | "unpublish") => Promise<void>;
  handleFormNameChange: (newName: string) => void;
  setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}

export interface Submission {
  id: number;
  formUrl: string;
  formId?: number;
  content: any;
  createdAt: string;
}

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

export interface FetchError {
  message: string;
  code?: number;
}

export interface AppContextType {
  selectors: {
    setFormName: (name: string) => void;
    setElements: (elements: FormElementInstance[]) => void;
    setSelectedElement: (element: FormElementInstance | null) => void;
    handleFormNameChange: (newName: string) => void;
    setUnsavedChanges: (flag: boolean) => void;
    setSubmissions: (submissions: Submission[]) => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setForms: (forms: Form[] | []) => void;
    setForm: (form: Form | null) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };
  data: {
    formName: string;
    elements: FormElementInstance[];
    selectedElement: FormElementInstance | null;
    unsavedChanges: boolean;
    loading: boolean;
    form: Form | null;
    forms: Form[];
    submissions: Submission[];
    subscriptionPlans: SubscriptionPlan[];
    error: string | null;
  };
  actions: {
    createForm: (newForm: {
      name: string;
      description: string;
    }) => Promise<{ formId: number; shareURL: string } | null>;
    createBusiness: (businessData: any) => Promise<boolean>;
    fetchForms: (businessId: number) => Promise<void>;
    fetchSubmissions: (shareURL: string) => Promise<void>;
    fetchFormByShareUrl: (shareURL: string) => Promise<Form | null>;
    fetchFormByShareUrlPublic: (shareURL: string) => Promise<void>;
    fetchClientSubmissions: (userId: number) => Promise<void>;
    fetchSubscriptionPlans: () => Promise<void>;
    saveForm: () => Promise<void>;
    publishForm: (action: "publish" | "unpublish") => Promise<void>;
    addElement: (index: number, element: FormElementInstance) => void;
    removeElement: (id: string) => void;
    updateElement: (id: string, element: FormElementInstance) => void;
    deleteForm: (formId: number) => Promise<void>;
    getFormSubmissionByCaseId: (caseId: string) => Promise<Submission | null>;
    getMissingFields: (submission: Submission) => Promise<string[]>;
  };
}

// ==================================================================================
// ==================================================================================

export interface SummaryCard {
  title: string;
  value: string;
  change: string;
  changePercentage: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  customer: Customer;
  type: string;
  status: string;
  date: string;
  amount: string;
}

export interface OrderDetail extends Order {
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  shipping: {
    address: string;
    city: string;
    postalCode: string;
    cost: string;
  };
  payment: {
    method: string;
    cardLastFour: string;
  };
}

export interface DashboardBodyProps {
  summaryCards?: SummaryCard[];
  recentOrders?: Order[];
  selectedOrder?: OrderDetail;
}

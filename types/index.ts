import { ElementsType } from "@/components/forms/FormElements";
import { Dispatch, SetStateAction } from "react";

export interface Submission {
  id: number;
  formId: number;
  content: any;
  createdAt: string;
}

export interface Form {
  id: number;
  name: string;
  description: string | null;
  published: boolean;
  visits: number;
  submissions: number;
  extraAttributes?: Record<string, any>;
  createdAt: string;
  fields: FormField[];
  shareURL?: string;
  businessId: number;
  landingPageId?: number | null;
  FormSubmissions?: Submission[];
}

export interface FormField {
  id: string;
  type: ElementsType;
  label?: string;
  required?: boolean;
  extraAttributes: {
    // Remove the possibility of undefined here
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

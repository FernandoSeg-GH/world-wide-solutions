import { ElementsType } from "@/components/forms/FormElements";

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
  extraAttributes?: {
    label?: string;
    required?: boolean;
    placeHolder?: string;
    helperText?: string;
    options?: { label: string; value: string }[];
    rows?: number;
    [key: string]: any;
  };
}

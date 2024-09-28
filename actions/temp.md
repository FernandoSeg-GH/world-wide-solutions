# FORM GENERATOR

## FILES AND CONTEXT:

## We're building a form generator with a nextjs 14 typescript app directory frontend web app, with a flask backend.

### FRONTEND

---

APP CONTEXT:

```tsx
// AppProvider.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  FormElementInstance,
  Form,
  AppContextType,
  FetchError,
  Submission,
} from "@/types";
import { useFetchForms } from "../hooks/useFetchForms";
import { toast } from "../ui/use-toast";

// Create Context
export const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use the AppContext
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
  initialForm?: Form; // Optional initial form, useful for pre-loading
}

export const AppProvider = ({
  children,
  initialForm,
}: AppProviderProps): JSX.Element => {
  const { data: session, status } = useSession();
  const [businessId, setBusinessId] = useState<number | undefined>(undefined);
  const {
    forms,
    isLoading: formsLoading,
    error: formsError,
  } = useFetchForms(businessId);

  const [form, setFormState] = useState<Form | null>(initialForm || null);
  const [formName, setFormName] = useState<string>(initialForm?.name || "");
  const [elements, setElements] = useState<FormElementInstance[]>(
    initialForm?.fields || []
  );
  const [selectedElement, setSelectedElement] =
    useState<FormElementInstance | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // const transformedFormsError = formsError
  //     ? { message: formsError }
  //     : null;

  // Effect to set businessId from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.businessId) {
      setBusinessId(session.user.businessId);
    }
  }, [session, status]);

  // Effect to initialize form and elements from fetched forms
  useEffect(() => {
    if (forms.length > 0 && !initialForm) {
      const fetchedForm = forms[0];
      setFormState(fetchedForm);
      setFormName(fetchedForm.name);
      setElements(fetchedForm.fields as FormElementInstance[]);
    }
  }, [forms, initialForm]);

  // Handlers
  const handleFormNameChange = (newName: string) => {
    setFormName(newName);
    setUnsavedChanges(true);
  };

  const setForm = (newForm: Form | null) => {
    setFormState(newForm);
    if (newForm) {
      setFormName(newForm.name);
      setElements(newForm.fields);
    } else {
      setFormName("");
      setElements([]);
    }
    setUnsavedChanges(true);
  };

  const saveForm = async () => {
    if (!form) {
      toast({
        title: "Error",
        description: "No form to save.",
        variant: "destructive",
      });
      return;
    }
    try {
      console.log("Elements before saving:", elements);

      setLoading(true);

      const response = await fetch("/api/forms/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          name: formName,
          fields: elements, // Using centralized elements state
          share_url: form.shareURL,
          business_id: form.businessId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error saving form.");
      }

      const result = await response.json();
      // Optionally, update form state with result
      setUnsavedChanges(false);
      toast({
        title: "Form Saved",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save form.",
        variant: "destructive",
      });
      console.error("Save Form Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const publishForm = async (action: "publish" | "unpublish") => {
    if (!form) {
      toast({
        title: "Error",
        description: "No form to publish/unpublish.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);

      const response = await fetch("/api/forms/publish-unpublish-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: form.id, action }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${action}ing form.`);
      }

      const result = await response.json();
      // Optionally, update form state with result
      toast({
        title: `Success`,
        description: `Form has been ${
          action === "publish" ? "published" : "unpublished"
        }.`,
      });
      // Optionally update form state if necessary
      setForm(form ? { ...form, published: action === "publish" } : form);
      window.location.reload(); // Force refresh after publishing
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Something went wrong`,
        variant: "destructive",
      });
      console.error(`${action} Form Error:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Designer actions
  const addElement = (index: number, element: FormElementInstance) => {
    console.log("Adding element:", element);
    setElements((prev) => {
      const newElements = [...prev];
      newElements.splice(index, 0, element);
      return newElements;
    });
    toast({
      title: "Element Added",
      description: "A new element has been added.",
      variant: "default",
    });
    setUnsavedChanges(true);
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
    toast({
      title: "Element Removed",
      description: "An element has been removed.",
      variant: "default",
    });
    setUnsavedChanges(true);
  };

  const updateElementHandler = (id: string, element: FormElementInstance) => {
    setElements((prev) => {
      const newElements = [...prev];
      const index = newElements.findIndex((el) => el.id === id);
      if (index !== -1) {
        newElements[index] = element;
      }
      return newElements;
    });
    toast({
      title: "Element Updated",
      description: "An element has been updated.",
      variant: "default",
    });
    setUnsavedChanges(true);
  };

  // Delete Form Action
  const deleteForm = async (formId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/delete?formId=${formId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete form");
      }

      toast({
        title: "Form Deleted",
        description:
          "The form and all associated data have been successfully deleted.",
      });

      // Optionally, refresh forms list
      // If using SWR or similar, you can trigger a revalidation
      // For now, we'll just reload the page
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete the form.",
        variant: "destructive",
      });
      console.error("Error deleting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (shareURL: string) => {
    console.log("Fetching submissions for shareURL:", shareURL);
    try {
      const response = await fetch(
        `/api/forms/share_url/${shareURL}/submissions`
      );
      if (!response.ok) {
        const errorData = await response.text(); // log the raw error data for debugging
        console.error(`Error fetching submissions: ${errorData}`);
        throw new Error(`Error fetching submissions: ${response.status}`);
      }
      const data = await response.json();
      if (data.submissions.length === 0) {
        console.log("No submissions for this form.");
      }
      setSubmissions(data.submissions || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch submissions: ${error.message}`,
        variant: "destructive",
      });
      console.error("Fetch Submissions Error:", error);
    }
  };

  useEffect(() => {
    if (form) {
      fetchSubmissions(form.shareURL);
    }
  }, [form]);

  const contextValue: AppContextType = {
    selectors: {
      setFormName,
      setElements,
      setSelectedElement,
      handleFormNameChange,
      setUnsavedChanges,
      setForm, // Added setForm
      setSubmissions,
    },
    data: {
      formName,
      elements,
      selectedElement,
      unsavedChanges,
      loading,
      form,
      forms,
      formsLoading,
      formsError,
      submissions,
    },
    actions: {
      saveForm,
      publishForm,
      addElement,
      removeElement,
      updateElement: updateElementHandler,
      deleteForm, // Added deleteForm action
      fetchSubmissions,
    },
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
```

---

TYPES:

```ts
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

export interface Form {
  id: number;
  name: string;
  fields: FormElementInstance[];
  shareURL: string;
  businessId: number;
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
  formId: number;
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
    setElements: Dispatch<SetStateAction<FormElementInstance[]>>;
    setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>;
    handleFormNameChange: (newName: string) => void;
    setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
    setForm: (newForm: Form | null) => void;
    setSubmissions: Dispatch<SetStateAction<Submission[]>>;
  };
  data: {
    formName: string;
    elements: FormElementInstance[];
    selectedElement: FormElementInstance | null;
    unsavedChanges: boolean;
    loading: boolean;
    form: Form | null;
    forms: Form[];
    formsLoading: boolean;
    formsError: FetchError | null;
    submissions: Submission[];
  };
  actions: {
    saveForm: () => Promise<void>;
    publishForm: (action: "publish" | "unpublish") => Promise<void>;
    addElement: (index: number, element: FormElementInstance) => void;
    removeElement: (id: string) => void;
    updateElement: (id: string, element: FormElementInstance) => void;
    deleteForm: (formId: number) => Promise<void>;
    fetchSubmissions: (url: string) => Promise<void>;
  };
}
```

---

ENDPOINTS::
forms/[share_url]

```tsx
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { share_url: string } }
) {
  const { share_url } = params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/form/share_url/${share_url}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Form not found" },
        { status: response.status }
      );
    }

    const formData = await response.json();
    return NextResponse.json(formData, { status: 200 });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Failed to fetch form details" },
      { status: 500 }
    );
  }
}
```

---

forms/[share_url]/submissions

```tsx
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { share_url: string } }
) {
  const { share_url } = params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/content/${share_url}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Submissions not found" },
        { status: response.status }
      );
    }

    const submissionsData = await response.json();
    return NextResponse.json(submissionsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
```

---

forms/create

```tsx
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";
  const formData = await request.json(); // form data from the client

  try {
    const response = await fetch(`${API_URL}/forms/create_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Form creation failed" },
      { status: 500 }
    );
  }
}
```

---

forms/delete

```tsx
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formId = searchParams.get("formId");

  if (!formId) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  // Check if token is expired and refresh if necessary (Optional: implement token refresh logic)
  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/form/${formId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // Use session token
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error deleting form: ${response.status} ${response.statusText} ${errorText}`
      );
      return NextResponse.json(
        { error: "Failed to delete form" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    );
  }
}
```

---

forms/get-form

```tsx
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shareUrl = searchParams.get("shareUrl");

  if (!shareUrl) {
    return NextResponse.json(
      { message: "shareUrl is required" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";
  try {
    const response = await fetch(
      `${API_URL}/forms/form/share_url/${shareUrl}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`, // JWT token from NextAuth session
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching form by share_url: ${response.status} ${response.statusText} ${errorText}`
      );
      return NextResponse.json(
        { message: `Failed to fetch form by share_url: ${errorText}` },
        { status: response.status }
      );
    }

    const form = await response.json();
    console.log("form data:", form);
    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.error("Error fetching form by share_url:", error);
    return NextResponse.json(
      { message: "Failed to fetch form by share_url" },
      { status: 500 }
    );
  }
}
```

---

forms/get-form-content

```tsx
// app/api/forms/get-form-content.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formUrl = searchParams.get("formUrl");

  if (!formUrl) {
    return NextResponse.json(
      { error: "Form URL is required" },
      { status: 400 }
    );
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/content/${formUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch form content: ${errorText}` },
        { status: response.status }
      );
    }

    const formContent = await response.json();
    return NextResponse.json(formContent, { status: 200 });
  } catch (error) {
    console.error("Error fetching form content:", error);
    return NextResponse.json(
      { error: "Failed to fetch form content" },
      { status: 500 }
    );
  }
}
```

---

forms/get-forms

```tsx
// app/api/forms/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  // Extract the businessId from query parameters
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { error: "Business ID is required" },
      { status: 400 }
    );
  }
  console.log("businessId", businessId);
  try {
    const response = await fetch(`${API_URL}/forms/${businessId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching forms: ${response.status} ${response.statusText} ${errorText}`
      );
      return NextResponse.json(
        { error: "Failed to fetch forms" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

---

forms/publish-unpublish-form

```tsx
// app/api/forms/get-form-content.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust the import path as needed

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const formUrl = searchParams.get("formUrl");

  if (!formUrl) {
    return NextResponse.json(
      { error: "Form URL is required" },
      { status: 400 }
    );
  }

  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/content/${formUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch form content: ${errorText}` },
        { status: response.status }
      );
    }

    const formContent = await response.json();
    return NextResponse.json(formContent, { status: 200 });
  } catch (error) {
    console.error("Error fetching form content:", error);
    return NextResponse.json(
      { error: "Failed to fetch form content" },
      { status: 500 }
    );
  }
}
```

---

### BACKEND

## models:

```py
# app/models.py
import json
import uuid
from sqlalchemy.dialects.postgresql import UUID
from .extensions import db
from datetime import datetime
from enum import Enum
from sqlalchemy import UniqueConstraint, func, Text
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import JSONB


# ENUM DEFINITIONS

class PermissionEnum(Enum):
    READ_ONLY = 'read_only'
    FULL_ACCESS = 'full_access'


class TaskStatusEnum(Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'


class TaskPriorityEnum(Enum):
    LOW = 'low'
    NORMAL = 'normal'
    HIGH = 'high'


class SocialPlatformEnum(Enum):
    TWITTER = 'Twitter'
    LINKEDIN = 'LinkedIn'
    FACEBOOK = 'Facebook'
    INSTAGRAM = 'Instagram'


class ChatTypeEnum(Enum):
    TEXT = 'text'
    IMAGE = 'image'
    VIDEO = 'video'
    AUDIO = 'audio'


# USER MODEL
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    _password = db.Column('password', db.String(255), nullable=False)  # Use a fixed length for hashed passwords
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=True)
    last_login_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = db.Column(db.Boolean, default=True)
    onboarded = db.Column(db.Boolean, default=False)

    # Relationships
    sent_messages = db.relationship('Message', back_populates='sender', cascade="all, delete-orphan")
    received_messages = db.relationship('MessageRecipient', back_populates='user', cascade="all, delete-orphan")
    role = db.relationship('Role', back_populates='users')
    business = db.relationship('Business', back_populates='users')
    tasks = db.relationship('Task', back_populates='assigned_to', cascade="all, delete-orphan")
    chats = db.relationship('Chat', back_populates='user', cascade="all, delete-orphan")
    ai_characters = db.relationship('UserAICharacter', back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password):
        self._password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self._password, password)

    def __repr__(self):
        return f"<User {self.username}>"


# ROLE MODEL
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    users = db.relationship('User', back_populates='role', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Role {self.name}>"


# BUSINESS MODEL
class Business(db.Model):
    __tablename__ = 'businesses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    domain = db.Column(db.String(255), nullable=True, unique=True, index=True)
    subscription_plan_id = db.Column(db.Integer, db.ForeignKey('subscription_plans.id'), nullable=True)
    description = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(20), nullable=True)

    url_linkedin = db.Column(db.String(255), nullable=True)
    url_instagram = db.Column(db.String(255), nullable=True)
    url_facebook = db.Column(db.String(255), nullable=True)
    url_twitter = db.Column(db.String(255), nullable=True)
    url_tiktok = db.Column(db.String(255), nullable=True)
    url_youtube = db.Column(db.String(255), nullable=True)
    seo_description = db.Column(db.Text, nullable=True)
    business_email = db.Column(db.String(255), nullable=True)
    profile_image_url = db.Column(db.String(255), nullable=True)
    background_image_url = db.Column(db.String(255), nullable=True)

    # Relationships
    users = db.relationship('User', back_populates='business', cascade="all, delete-orphan")
    subscription_plan = db.relationship('SubscriptionPlan', back_populates='businesses')
    ai_characters = db.relationship('BusinessDeveloperAI', back_populates='business', cascade="all, delete-orphan")
    tasks = db.relationship('Task', back_populates='business', cascade="all, delete-orphan")
    forms = db.relationship('Form', back_populates='business', cascade="all, delete-orphan")
    landing_pages = db.relationship('LandingPage', back_populates='business', cascade="all, delete-orphan")
    social_media_posts = db.relationship('SocialMediaPost', back_populates='business', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Business {self.name}>"


# SUBSCRIPTION PLAN MODEL
class SubscriptionPlan(db.Model):
    __tablename__ = 'subscription_plans'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    features = db.Column(db.JSON, nullable=True)

    # Relationships
    businesses = db.relationship('Business', back_populates='subscription_plan', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SubscriptionPlan {self.name}>"


# BUSINESS DEVELOPER AI MODEL
class BusinessDeveloperAI(db.Model):
    __tablename__ = 'ai_characters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)

    __table_args__ = (
        UniqueConstraint('name', 'business_id', name='_ai_character_business_uc'),
    )

    # Relationships
    business = db.relationship('Business', back_populates='ai_characters')
    tasks = db.relationship('Task', back_populates='ai_character', cascade="all, delete-orphan")
    users = db.relationship('UserAICharacter', back_populates='ai_character', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BusinessDeveloperAI {self.name}>"


# MANY-TO-MANY USER-AI CHARACTERS ASSOCIATION TABLE
class UserAICharacter(db.Model):
    __tablename__ = 'user_ai_character'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    ai_character_id = db.Column(db.Integer, db.ForeignKey('ai_characters.id'), primary_key=True)
    permissions = db.Column(db.Enum(PermissionEnum), nullable=False)  # Using Enum for permissions

    # Relationships
    user = db.relationship('User', back_populates='ai_characters')
    ai_character = db.relationship('BusinessDeveloperAI', back_populates='users')

    def __repr__(self):
        return f"<UserAICharacter User:{self.user_id} AICharacter:{self.ai_character_id}>"


# TASK MODEL
class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    ai_character_id = db.Column(db.Integer, db.ForeignKey('ai_characters.id'), nullable=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    status = db.Column(db.Enum(TaskStatusEnum), nullable=False, default=TaskStatusEnum.PENDING)
    priority = db.Column(db.Enum(TaskPriorityEnum), default=TaskPriorityEnum.NORMAL)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    assigned_to = db.relationship('User', back_populates='tasks')
    ai_character = db.relationship('BusinessDeveloperAI', back_populates='tasks')
    business = db.relationship('Business', back_populates='tasks')

    def __repr__(self):
        return f"<Task {self.name} Status:{self.status.value}>"


# app/models.py

import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import UniqueConstraint
from sqlalchemy.sql import func
from app.extensions import db
from sqlalchemy.dialects.postgresql import JSON
class Form(db.Model):
    __tablename__ = 'forms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    fields = db.Column(JSON, nullable=False)
    extra_attributes = db.Column(db.JSON, nullable=True)  # Changed to JSON
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    landing_page_id = db.Column(db.Integer, db.ForeignKey('landing_pages.id'), nullable=True)
    description = db.Column(db.Text, nullable=True)
    visits = db.Column(db.Integer, nullable=False, default=0)
    published = db.Column(db.Boolean, nullable=False, default=False)  # Made non-nullable
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    share_url = db.Column(db.String(36), unique=True, nullable=True)  # New field (UUID as string)

    # Relationships
    business = db.relationship('Business', back_populates='forms')
    landing_page = db.relationship('LandingPage', back_populates='forms')
    submissions = db.relationship('FormSubmission', back_populates='form', lazy='dynamic', cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('name', 'business_id', name='_form_business_uc'),
    )

    def __repr__(self):
        return f"<Form {self.name}>"



    @property
    def extra_attributes_data(self):
        return self.extra_attributes

    @extra_attributes_data.setter
    def extra_attributes_data(self, value):
        self.extra_attributes = value


class FormSubmission(db.Model):
    __tablename__ = 'form_submissions'
    id = db.Column(db.Integer, primary_key=True)
    form_id = db.Column(db.Integer, db.ForeignKey('forms.id'), nullable=False)
    content = db.Column(db.JSON, nullable=False)  # Store the submission content as JSON
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), index=True)

    form = db.relationship('Form', back_populates='submissions')

    def __repr__(self):
        return f"<FormSubmission ID:{self.id} FormID:{self.form_id}>"

# LANDING PAGE MODEL
class LandingPage(db.Model):
    __tablename__ = 'landing_pages'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False, index=True)
    content = db.Column(db.Text, nullable=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)

    # Relationships
    business = db.relationship('Business', back_populates='landing_pages')
    forms = db.relationship('Form', back_populates='landing_page', cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('url', 'business_id', name='_landingpage_business_uc'),
    )

    def __repr__(self):
        return f"<LandingPage {self.url}>"


# SOCIAL MEDIA POST MODEL
class SocialMediaPost(db.Model):
    __tablename__ = 'social_media_posts'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    posted_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), index=True)
    platform = db.Column(db.Enum(SocialPlatformEnum), nullable=False)
    metrics = db.Column(db.JSON, nullable=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)

    # Relationships
    business = db.relationship('Business', back_populates='social_media_posts')

    def __repr__(self):
        return f"<SocialMediaPost Platform:{self.platform.value} PostedAt:{self.posted_at}>"


# CHAT MODEL
class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime(timezone=True), server_default=func.now(), index=True)
    chat_type = db.Column(db.Enum(ChatTypeEnum), nullable=False, default=ChatTypeEnum.TEXT)

    # Relationships
    user = db.relationship('User', back_populates='chats')

    def __repr__(self):
        return f"<Chat UserID:{self.user_id} Type:{self.chat_type.value}>"


# MESSAGE MODEL
class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    sender = db.relationship('User', back_populates='sent_messages')
    recipients = db.relationship('MessageRecipient', back_populates='message', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message ID:{self.id} SenderID:{self.sender_id}>"


# MESSAGE RECIPIENT MODEL
class MessageRecipient(db.Model):
    __tablename__ = 'message_recipients'
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime(timezone=True), nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='received_messages')
    message = db.relationship('Message', back_populates='recipients')

    def __repr__(self):
        return f"<MessageRecipient MessageID:{self.message_id} UserID:{self.user_id} Read:{self.read}>"
```

---

form route:

```py
# app/routes/form.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Form, Business, User, FormSubmission
from app.extensions import db
import logging
from psycopg2.extras import Json
import json
from sqlalchemy.exc import SQLAlchemyError
from uuid import uuid4
import uuid
import re

bp = Blueprint('form', __name__, url_prefix='/forms')
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)  # Set to INFO or DEBUG
logger.addHandler(handler)

def validate_form_data(data):
    if not isinstance(data.get('fields'), list):
        return False, "Fields should be a list"

    for field in data['fields']:
        if not field.get('id') or not field.get('type'):
            return False, "Each field must have an id and a type"

    return True, None


def generate_slug(name: str) -> str:
    # Convert the name to a URL-friendly slug
    slug = re.sub(r'[^a-zA-Z0-9-]', '', name.lower().replace(' ', '-'))
    if len(slug) > 24:
        slug = slug[:24]
    return slug


@bp.route('/create_form', methods=['POST'])
@jwt_required()
def create_form():
    data = request.get_json()
    user_id = get_jwt_identity()
    business_id = data.get('business_id')
    name = data.get('name')
    fields = data.get('fields', [])
    description = data.get('description')
    extra_attributes = data.get('extra_attributes', {})

    if not name or not business_id:
        return jsonify({"message": "Missing required fields"}), 400

    # Ensure proper slug generation from the name
    share_url = generate_slug(name)

    existing_form = Form.query.filter_by(share_url=share_url).first()
    if existing_form:
        unique_id = str(uuid.uuid4())[:8]
        share_url = f"{share_url}-{unique_id}"  # Append unique identifier

    form = Form(
        name=name,
        fields=fields,
        business_id=business_id,
        description=description,
        extra_attributes=extra_attributes,
        share_url=share_url
    )

    try:
        db.session.add(form)
        db.session.commit()
        return jsonify({"message": "Form created successfully", "form_id": form.id, "share_url": form.share_url}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating form: {str(e)}")
        return jsonify({"error": "An error occurred while creating the form"}), 500


# Submit data for a form
@bp.route('/submit/<string:formUrl>', methods=['POST'])
@jwt_required()
def submit_form(formUrl):
    form = Form.query.filter_by(share_url=formUrl).first()
    if not form:
        return jsonify({"message": "Form not found"}), 404

    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({"message": "Content is required"}), 400

    submission = FormSubmission(form_id=form.id, content=content)

    try:
        db.session.add(submission)
        db.session.commit()
        return jsonify({"message": "Form submitted successfully", "submission_id": submission.id}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting form: {str(e)}")
        return jsonify({"error": "An error occurred while submitting the form"}), 500

# Get all forms for a user's business
# Get all forms for a user's business
@bp.route('/<int:business_id>', methods=['GET'])
@jwt_required()
def get_forms(business_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    try:
        # Query to get forms for the specific business with pagination
        forms = Form.query.filter_by(business_id=business_id).paginate(page=page, per_page=per_page)
    except Exception as e:
        logger.error(f"Database query failed: {e}")
        return jsonify({"message": "Internal server error"}), 500

    if forms.total == 0:
        return jsonify({"message": "No forms found for this business"}), 404

    forms_data = []
    for form in forms.items:
        fields = form.fields if isinstance(form.fields, list) else []
        if not isinstance(form.fields, list):
            logger.warning(f"Form ID {form.id} has malformed fields.")

        # Get the count of submissions for each form
        try:
            submissions_count = form.submissions.count()
        except AttributeError as e:
            logger.error(f"Error counting submissions for form ID {form.id}: {e}")
            submissions_count = 0

        # Build the form data object
        form_data = {
            'id': form.id,
            'name': form.name,
            'fields': fields,
            'createdAt': form.created_at.isoformat(),
            'published': form.published if form.published is not None else False,
            'visits': form.visits if form.visits is not None else 0,
            'submissions': submissions_count,  # Ensure submissions count is an integer
            'description': form.description,
            'extraAttributes': form.extra_attributes,  # Include extra attributes
            'shareURL': form.share_url if form.share_url else None  # Include share URL if it exists
        }

        forms_data.append(form_data)

    return jsonify({
        'forms': forms_data,
        'total': forms.total,
        'page': forms.page,
        'pages': forms.pages
    }), 200

# GET Individual Form:
@bp.route('/form/<int:form_id>', methods=['GET'])
@jwt_required()
def get_form(form_id):
    logger.info(f"Fetching form with ID: {form_id}")
    form = Form.query.get(form_id)

    if not form:
        logger.info(f"Form with ID {form_id} not found")
        return jsonify({"message": "Form not found"}), 404
    # Log the fields to check their structure
    logger.info(f"Fields retrieved for form ID {form_id}: {form.fields}")


    # Build the response data
    form_data = {
        'id': form.id,
        'name': form.name,
        'fields': form.fields,  # Directly use form.fields
        'extraAttributes': form.extra_attributes,  # Or form.extra_attributes_data
        'createdAt': form.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT'),
        'visits': form.visits,
        'submissions': [s.id for s in form.submissions],
        'published': form.published,
        'description': form.description,
        'shareURL': str(form.share_url) if form.share_url else None,  # Include share_url
    }

    return jsonify(form_data), 200


# Edit an existing form
@bp.route('/form/<int:form_id>', methods=['PUT'])
@jwt_required()
def edit_form(form_id):
    form = Form.query.get(form_id)

    if not form:
        return jsonify({"message": "Form not found"}), 404

    data = request.get_json()
    form.name = data.get('name', form.name)

    if 'fields' in data:
        form.fields = data['fields']  # Assign directly without Json

    if 'extraAttributes' in data:
        form.extra_attributes = data['extraAttributes']  # Use 'extra_attributes' directly

    logger.info(f"Data received for update: {data}")
    logger.info(f"Form fields before update: {form.fields}")

    try:
        db.session.commit()  # Commit the changes to the database

        # Build the response data
        form_data = {
            'id': form.id,
            'name': form.name,
            'fields': form.fields,  # Return updated fields directly
            'extraAttributes': form.extra_attributes,
            'createdAt': form.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT'),
            'visits': form.visits,
            'submissions': [s.id for s in form.submissions],
            'published': form.published,
            'description': form.description,
            'shareURL': str(form.share_url) if form.share_url else None,
        }

        return jsonify(form_data), 200  # Return the updated form data
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating form: {str(e)}")
        return jsonify({"error": "An error occurred while updating the form"}), 500

# Submissions Route: Fetch submissions for a form
@bp.route('/<int:form_id>/submissions', methods=['GET'])
@jwt_required()
def get_form_submissions(form_id):
    user_id = get_jwt_identity()  # Get the current user's ID

    # Find the user and form
    user = User.query.get(user_id)
    form = Form.query.get(form_id)

    if not form:
        return jsonify({"message": "Form not found"}), 404

    # Check if the user has access to the form based on role or business_id
    if user.role_id != 1 and form.business_id != user.business_id:
        return jsonify({"message": "Unauthorized access"}), 403

    # If user has permission, fetch submissions
    try:
        submissions = FormSubmission.query.filter_by(form_id=form_id).all()
        submission_data = [
            {
                "id": submission.id,
                "content": submission.content,  # Assuming content is JSON
                "created_at": submission.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for submission in submissions
        ]
        return jsonify({"submissions": submission_data}), 200
    except Exception as e:
        logger.error(f"Error fetching submissions for form ID {form_id}: {str(e)}")
        return jsonify({"error": "An error occurred while fetching submissions"}), 500


@bp.route('/content/<string:form_url>', methods=['GET'])
def get_form_content_by_url(form_url):
    logger.info(f"Fetching form with share_url: {form_url}")
    try:
        form = Form.query.filter_by(share_url=form_url).first()
        if not form:
            logger.error(f"Form not found for share_url: {form_url}")
            return jsonify({"message": "Form not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching form by share_url {form_url}: {e}")
        return jsonify({"error": "Failed to fetch form"}), 500

    if not form_url:
        logger.error(f"Form URL not found")
        return jsonify({"message": "Form not found"}), 404

    if not form:
        logger.error(f"Form not found for share_url: {form_url}")
        return jsonify({"message": "Form not found"}), 404

    form_data = {
        'id': form.id,
        'name': form.name,
        'fields': form.fields,
        'extraAttributes': form.extra_attributes,
        'createdAt': form.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'visits': form.visits,
        'submissions': [s.id for s in form.submissions],  # Include submissions if necessary
    }

    return jsonify(form_data), 200


# Delete a form
@bp.route('/form/<int:form_id>', methods=['DELETE'])
@jwt_required()
def delete_form(form_id):
    form = Form.query.get(form_id)

    if not form:
        return jsonify({"message": "Form not found"}), 404

    try:
        db.session.delete(form)
        db.session.commit()
        return jsonify({"message": "Form deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting form: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the form"}), 500

# GET FORM BY URL
@bp.route('/form/share_url/<string:share_url>', methods=['GET'])
@jwt_required()
def get_form_by_share_url(share_url):
    # Log the incoming share_url for debugging
    logger.info(f"Attempting to fetch form with share_url: {share_url}")

    form = Form.query.filter_by(share_url=share_url).first()

    if not form:
        logger.error(f"No form found with share_url: {share_url}")
        return jsonify({"message": "Form not found"}), 404

    # Build response data
    form_data = {
        'id': form.id,
        'name': form.name,
        'fields': form.fields,  # Assuming form.fields is JSON
        'extraAttributes': form.extra_attributes,  # Any other attributes
        'createdAt': form.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'visits': form.visits,
        'submissions': [s.id for s in form.submissions],
        'published': form.published,
        'description': form.description,
        'shareURL': form.share_url,
        'businessId': form.business_id
    }
    logger.info(f"Form found: {form_data}")
    return jsonify(form_data), 200


@bp.route('/save_form', methods=['POST'])
@jwt_required()
def save_form():
    user_id = get_jwt_identity()
    data = request.get_json()

    logger.info(f"Received data: {data}")

    form_id = data.get('form_id')
    fields = data.get('fields', [])
    name = data.get('name', 'Untitled Form')
    description = data.get('description', '')
    business_id = data.get('business_id')
    extra_attributes = data.get('extra_attributes', {})
    share_url = data.get('share_url')

    if not business_id:
        logger.error("Business ID is missing")
        return jsonify({"message": "Business ID is required"}), 400

    if not fields:
        logger.warning("No fields provided with the form data.")
        return jsonify({"message": "Form must contain at least one field"}), 400

    if form_id:
        form = Form.query.get(form_id)
        if not form:
            return jsonify({"message": "Form not found"}), 404
        form.fields = fields  # Ensure fields are updated
        form.name = name
        form.description = description
        form.extra_attributes = extra_attributes
        form.share_url = share_url  # Update the share_url if necessary
    else:
        form = Form(
            name=name,
            fields=fields,
            business_id=business_id,
            description=description,
            extra_attributes=extra_attributes,
            share_url=share_url  # Set the share_url on creation
        )
        db.session.add(form)

    try:
        db.session.commit()
        logger.info(f"Form saved: {form.id}")
        return jsonify({"message": "Form saved", "form_id": form.id, "name": form.name}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving form: {e}")
        return jsonify({"message": f"Error saving form: {str(e)}"}), 500



@bp.route('/unpublish_form', methods=['POST'])
@jwt_required()
def unpublish_form():
    user_id = get_jwt_identity()
    data = request.get_json()

    form_id = data.get('form_id')

    # Fetch the form by ID
    form = Form.query.get(form_id)

    if not form:
        logger.error(f"Form not found with ID: {form_id}")
        return jsonify({"message": "Form not found"}), 404

    # If already unpublished, return a message
    if not form.published:
        logger.info(f"Form {form_id} is already unpublished.")
        return jsonify({"message": "Form already unpublished"}), 200

    # Unpublish the form by setting the published flag to False
    form.published = False

    try:
        db.session.commit()
        logger.info(f"Form {form_id} has been unpublished.")
        return jsonify({"message": "Form unpublished successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error unpublishing form: {str(e)}")
        return jsonify({"message": "Error unpublishing form"}), 500

@bp.route('/publish_unpublish_form', methods=['POST'])
@jwt_required()
def publish_unpublish_form():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Retrieve form_id and action from the request data
    form_id = data.get('form_id')
    action = data.get('action')

    # Log the values after they are retrieved
    logger.info(f"Received form_id: {form_id}, action: {action}")

    if not form_id or not action:
        return jsonify({"message": "Form ID and action are required"}), 400

    # Fetch the form by ID
    form = Form.query.get(form_id)

    if not form:
        logger.error(f"Form not found with ID: {form_id}")
        return jsonify({"message": "Form not found"}), 404

    # Determine the action (publish or unpublish)
    if action == "publish":
        if form.published:
            logger.info(f"Form {form_id} is already published.")
            return jsonify({"message": "Form already published", "share_url": form.share_url}), 200

        form.published = True
        if not form.share_url:
            form.share_url = str(uuid.uuid4())  # Generate share URL if not present
    elif action == "unpublish":
        if not form.published:
            logger.info(f"Form {form_id} is already unpublished.")
            return jsonify({"message": "Form already unpublished"}), 200

        form.published = False
    else:
        return jsonify({"message": "Invalid action"}), 400

    try:
        db.session.commit()
        logger.info(f"Form {form_id} has been {action}ed.")
        return jsonify({"message": f"Form {action}ed successfully", "share_url": form.share_url}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error {action}ing form: {str(e)}")
        return jsonify({"message": f"Error {action}ing form"}), 500


@bp.route('/share_url/<string:share_url>/submissions', methods=['GET'])
@jwt_required()
def get_form_submissions_by_share_url(share_url):
    # Fetch the form based on the share_url
    form = Form.query.filter_by(share_url=share_url).first()

    if not form:
        return jsonify({"message": "Form not found"}), 404

    # Fetch submissions for the form
    submissions = FormSubmission.query.filter_by(form_id=form.id).all()
    submission_data = [
        {
            "id": submission.id,
            "content": submission.content,
            "created_at": submission.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for submission in submissions
    ]

    return jsonify({"submissions": submission_data}), 200


```

---

GOALS:

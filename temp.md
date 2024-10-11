ok.
here is my original appcontext:

```'use client';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { useSession } from 'next-auth/react';
import { FormElementInstance, Form, AppContextType, FetchError, Submission, SubscriptionPlan } from '@/types';
import { useFetchForms } from '../hooks/useFetchForms';
import { toast } from '../components/ui/use-toast';
import { deepEqual } from '@/lib/utils';

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
    initialForm?: Form;
}

export const AppProvider = ({ children, initialForm }: AppProviderProps): JSX.Element => {
    const { data: session, status } = useSession();
    const [godMode, setGodMode] = useState<boolean>(false);
    const [form, setFormState] = useState<Form | null>(initialForm ?? null);
    const [forms, setForms] = useState<Form[]>([]);

    const [formName, setFormName] = useState<string>(initialForm?.name || '');
    const [elements, setElements] = useState<FormElementInstance[]>(initialForm?.fields || []);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const formInitializedRef = useRef(false);

    const toggleGodMode = useCallback(() => {
        setGodMode((prev) => !prev);
        toast({
            title: godMode ? 'God Mode Disabled' : 'God Mode Enabled',
            description: godMode
                ? 'You are now in normal mode.'
                : 'You have special privileges now.',
        });
    }, [godMode]);

    useEffect(() => {
        let keySequence: string[] = [];

        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;


            keySequence.push(key.toUpperCase());

            if (keySequence.length > 3) {
                keySequence.shift();
            }

            if (keySequence.join('') === 'GOD') {
                toggleGodMode();
                keySequence = [];
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleGodMode]);


    const fetchSubscriptionPlans = useCallback(async () => {
        try {
            const res = await fetch("/api/business/subscription");
            const data: SubscriptionPlan[] = await res.json();

            if (res.ok) {
                setSubscriptionPlans(data);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch subscription plans.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while fetching subscription plans.",
                variant: "destructive",
            });
        }
    }, []);

    // Create a business
    const createBusiness = useCallback(async (businessData: any) => {
        try {
            setLoading(true);

            const res = await fetch("/api/business/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(businessData),
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Business created successfully.",
                });
                return true;
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to create business.",
                    variant: "destructive",
                });
                return false;
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating the business.",
                variant: "destructive",
            });
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const createForm = useCallback(async ({ name, description }: { name: string; description: string }) => {
        try {
            if (!session || !session.accessToken) {
                throw new Error('User is not authenticated');
            }

            const response = await fetch('/api/forms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    business_id: session.user.businessId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create form');
            }

            const result = await response.json();
            return {
                formId: result?.form_id,
                shareURL: result?.share_url,
            };
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create form',
                variant: 'destructive',
            });
            return null;
        }
    }, [session?.user.businessId, session]);

    const fetchForms = useCallback(async (businessId: number) => {
        if (!businessId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/forms/get-forms?businessId=${businessId}`);
            const data = await response.json();

            if (response.ok) {
                setForms(data.forms);  // Ensure the forms state is updated
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch forms.');
        } finally {
            setLoading(false);
        }
    }, [setLoading]); // Add only necessary dependencies



    const handleFormNameChange = useCallback((newName: string) => {
        setFormName(newName);
        setUnsavedChanges(true);
    }, []);


    const setForm = useCallback((newForm: Form | null) => {
        setFormState((prevForm) => {
            if (deepEqual(prevForm, newForm)) {
                return prevForm;
            }

            if (newForm) {
                setFormName(newForm.name);
                setElements(newForm.fields);
                setUnsavedChanges(true);
            } else {
                setFormName('');
                setElements([]);
                setUnsavedChanges(true);
            }
            return newForm;
        });
    }, []);

    const saveForm = useCallback(async () => {
        if (!form) {
            toast({ title: 'Error', description: 'No form to save.', variant: 'destructive' });
            return;
        }
        try {
            setLoading(true);
            const response = await fetch('/api/forms/save-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    form_id: form.id,
                    name: formName,
                    fields: elements,
                    share_url: form.shareURL,
                    business_id: session?.user.businessId
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error saving form.');
            }

            const result = await response.json();

            setUnsavedChanges(false);
            toast({ title: 'Form Saved', description: 'Your changes have been saved.' });
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to save form.', variant: 'destructive' });
            console.error('Save Form Error:', error);
        } finally {
            setLoading(false);
        }
    }, [form, formName, elements]);

    const publishForm = useCallback(async (action: 'publish' | 'unpublish') => {
        if (!form) {
            toast({ title: 'Error', description: 'No form to publish/unpublish.', variant: 'destructive' });
            return;
        }
        try {
            setLoading(true);

            const response = await fetch('/api/forms/publish-unpublish-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ form_id: form.id, action }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Error ${action}ing form.`);
            }

            const result = await response.json();
            setForm(form ? { ...form, published: action === 'publish' } : form);

            toast({
                title: `Success`,
                description: `Form has been ${action === 'publish' ? 'published' : 'unpublished'}.`,
            });

        } catch (error: any) {
            toast({ title: 'Error', description: `Something went wrong`, variant: 'destructive' });
            console.error(`${action} Form Error:`, error);
        } finally {
            setLoading(false);
        }
    }, [form, setForm]);

    const addElement = useCallback((index: number, element: FormElementInstance) => {
        setElements((prev) => {
            const newElements = [...prev];
            newElements.splice(index, 0, element);
            return newElements;
        });
        toast({ title: 'Element Added', description: 'A new element has been added.', variant: 'default' });
        setUnsavedChanges(true);
    }, []);

    const removeElement = useCallback((id: string) => {
        console.log("Removing element with id:", id);
        setElements((prev) => {
            const updatedElements = prev.filter((element) => element.id !== id);
            console.log("Updated elements:", updatedElements);
            return updatedElements;
        });
        toast({ title: 'Element Removed', description: 'An element has been removed.', variant: 'default' });
        setUnsavedChanges(true);
    }, []);


    const updateElement = useCallback((id: string, element: FormElementInstance) => {
        setElements((prev) => {
            const newElements = [...prev];
            const index = newElements.findIndex((el) => el.id === id);
            if (index !== -1) {
                newElements[index] = element;
            }
            return newElements;
        });
        toast({ title: 'Element Updated', description: 'An element has been updated.', variant: 'default' });
        setUnsavedChanges(true);
    }, []);

    const deleteForm = useCallback(async (formId: number) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/forms/delete?formId=${formId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete form');
            }

            toast({
                title: 'Form Deleted',
                description: 'The form and all associated data have been successfully deleted.',
            });


            window.location.reload();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to delete the form.',
                variant: 'destructive',
            });
            console.error('Error deleting form:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSubmissions = useCallback(async (shareUrl: string) => {
        if (session) {
            try {
                const response = await fetch(`/api/forms/submissions?shareUrl=${shareUrl}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching submissions: ${response.statusText}`);
                }

                const data = await response.json();
                if (data?.submissions) {
                    setSubmissions(data.submissions);
                } else {
                    console.warn("No submissions found");
                }
            } catch (error) {
                console.error("Failed to fetch submissions", error);
            }
        }
    }, [session?.accessToken]);

    const fetchFormByShareUrl = async (shareUrl: string): Promise<Form | null> => {
        try {
            const response = await fetch(`/api/forms/share_url/${shareUrl}`);
            if (!response.ok) {
                throw new Error('Form not found');
            }
            const formData = await response.json();
            return formData as Form;
        } catch (error) {
            console.error('Error fetching form:', error);
            return null;
        }
    };

    const fetchFormByShareUrlPublic = useCallback(async (shareUrl: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/forms/get-form-public?shareUrl=${shareUrl}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch form');
            }
            const formData = await response.json();
            setFormState(formData); // Set the form in the state
            setElements(formData.fields || []);
            return formData; // Return the fetched form
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);


    const getFormSubmissionByCaseId = useCallback(async (caseId: string): Promise<Submission | null> => {
        try {
            setLoading(true);

            const response = await fetch(`/api/forms/get_submission_by_case_id?caseId=${caseId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`No submission found for caseId: ${caseId}`);
                    return null;
                }
                const errorData = await response.json();
                console.error(`Error fetching submission by caseId: ${errorData.message}`);
                throw new Error(`Error fetching submission: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.submission) {
                return data.submission as Submission;
            }

            return null;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to fetch submission: ${error.message}`,
                variant: 'destructive',
            });
            console.error('GetFormSubmissionByCaseId Error:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, [session]);

    const getMissingFields = useCallback(async (submission: Submission): Promise<string[]> => {
        try {
            if (!form) {
                toast({
                    title: 'Error',
                    description: 'Form data is missing.',
                    variant: 'destructive',
                });
                return [];
            }

            const parsedContent = submission.content;
            const missing: string[] = [];

            form.fields.forEach((field) => {
                const value = parsedContent[field.id];
                const isRequired = field.extraAttributes?.required;

                if (isRequired && (value === undefined || value === null || value === '')) {
                    const label = field.extraAttributes?.label || `Field ${field.id}`;
                    missing.push(label);
                }
            });

            return missing;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to determine missing fields: ${error.message}`,
                variant: 'destructive',
            });
            console.error('GetMissingFields Error:', error);
            return [];
        }
    }, [form]);

    const fetchClientSubmissions = useCallback(async () => {
        try {
            const response = await fetch(`/api/forms/client-submissions`);
            if (!response.ok) {
                if (response.status === 403) {
                    toast({
                        title: "Access Denied",
                        description: "You do not have permission to view these submissions.",
                        variant: "destructive",
                    });
                } else {
                    throw new Error('Failed to fetch client submissions');
                }
            }
            const data = await response.json();
            setSubmissions(data.submissions || []);
        } catch (error) {
            console.error('Error fetching client submissions:', error);
            toast({
                title: "Error",
                description: "An error occurred while fetching your submissions.",
                variant: "destructive",
            });
        }
    }, []);


    useEffect(() => {
        if (forms && forms.length > 0 && !initialForm && !formInitializedRef.current) {
            const fetchedForm = forms[0];
            setForm(fetchedForm);
            formInitializedRef.current = true;
        }
    }, [forms, initialForm, setForm]);

    useEffect(() => {
        if (form) {
            setLoading(true);
            fetchSubmissions(form.shareURL).finally(() => setLoading(false)); // Ensure async logic doesn't cause loops

        } else {
            setLoading(false);
        }
    }, [form, fetchSubmissions]); // Ensure only necessary dependencies are included


    const selectors = useMemo(() => ({
        setFormName,
        setError,
        setForms,
        setForm,
        setElements,
        setSelectedElement,
        handleFormNameChange,
        setUnsavedChanges,
        setSubmissions,
        setLoading
    }), [
        setFormName,
        setError,
        setForms,
        setForm,
        setElements,
        setSelectedElement,
        handleFormNameChange,
        setUnsavedChanges,
        setSubmissions,
        setLoading
    ]);

    const data = useMemo(() => ({
        formName,
        elements,
        selectedElement,
        loading,
        error,
        unsavedChanges,
        form,
        forms,
        submissions,
        subscriptionPlans,
        godMode
    }), [
        formName,
        elements,
        selectedElement,
        loading,
        error,
        unsavedChanges,
        form,
        forms,
        submissions,
        subscriptionPlans,
        godMode
    ]);

    const actions = useMemo(() => ({
        fetchForms,
        fetchClientSubmissions,
        fetchSubscriptionPlans,
        createBusiness,
        createForm,
        saveForm,
        publishForm,
        addElement,
        removeElement,
        updateElement,
        deleteForm,
        fetchSubmissions,
        fetchFormByShareUrl,
        fetchFormByShareUrlPublic,
        getFormSubmissionByCaseId,
        getMissingFields,
        toggleGodMode
    }), [
        fetchForms,
        fetchClientSubmissions,
        fetchSubscriptionPlans,
        createBusiness,
        createForm,
        saveForm,
        publishForm,
        addElement,
        removeElement,
        updateElement,
        deleteForm,
        fetchSubmissions,
        fetchFormByShareUrl,
        fetchFormByShareUrlPublic,
        getFormSubmissionByCaseId,
        getMissingFields,
        toggleGodMode
    ]);

    const contextValue: AppContextType = useMemo(() => ({
        selectors,
        data,
        actions,
    }), [selectors, data, actions]);

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
```

and our existing types:

```
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
    godMode: boolean;
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
    toggleGodMode: () => void;
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
```

---

now make sure our useFormState isn't missing anything:

```
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Form, FormElementInstance } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { deepEqual } from "@/lib/utils";

export const useFormState = (initialForm?: Form) => {
  const [form, setFormState] = useState<Form | null>(initialForm ?? null);
  const [forms, setForms] = useState<Form[]>([]);
  const [formName, setFormName] = useState<string>(initialForm?.name || "");
  const [elements, setElements] = useState<FormElementInstance[]>(
    initialForm?.fields || []
  );
  const [selectedElement, setSelectedElement] =
    useState<FormElementInstance | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const formInitializedRef = useRef(false);

  const handleFormNameChange = useCallback((newName: string) => {
    setFormName(newName);
    setUnsavedChanges(true);
  }, []);

  const setForm = useCallback((newForm: Form | null) => {
    setFormState((prevForm) => {
      if (deepEqual(prevForm, newForm)) {
        return prevForm;
      }

      if (newForm) {
        setFormName(newForm.name);
        setElements(newForm.fields);
        setUnsavedChanges(true);
      } else {
        setFormName("");
        setElements([]);
        setUnsavedChanges(true);
      }
      return newForm;
    });
  }, []);

  const addElement = useCallback(
    (index: number, element: FormElementInstance) => {
      setElements((prev) => {
        const newElements = [...prev];
        newElements.splice(index, 0, element);
        return newElements;
      });
      toast({
        title: "Element Added",
        description: "A new element has been added.",
      });
      setUnsavedChanges(true);
    },
    []
  );

  const removeElement = useCallback((id: string) => {
    setElements((prev) => {
      const updatedElements = prev.filter((element) => element.id !== id);
      return updatedElements;
    });
    toast({
      title: "Element Removed",
      description: "An element has been removed.",
    });
    setUnsavedChanges(true);
  }, []);

  const updateElement = useCallback(
    (id: string, element: FormElementInstance) => {
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
      });
      setUnsavedChanges(true);
    },
    []
  );

  return {
    form,
    forms,
    formName,
    elements,
    selectedElement,
    unsavedChanges,
    setForm,
    setForms,
    setFormName,
    setElements,
    setSelectedElement,
    setUnsavedChanges,
    handleFormNameChange,
    addElement,
    removeElement,
    updateElement,
    formInitializedRef,
  };
};

```

nor the useSubmissions:

```
"use client";
import { useState, useCallback } from "react";
import { Submission } from "@/types";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { data: session } = useSession();

  const fetchSubmissions = useCallback(
    async (shareUrl: string) => {
      if (session) {
        try {
          const response = await fetch(
            `/api/forms/submissions?shareUrl=${shareUrl}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching submissions: ${response.statusText}`
            );
          }

          const data = await response.json();
          if (data?.submissions) {
            setSubmissions(data.submissions);
          } else {
            console.warn("No submissions found");
          }
        } catch (error) {
          console.error("Failed to fetch submissions", error);
        }
      }
    },
    [session]
  );

  // Other submission-related functions...

  return {
    submissions,
    setSubmissions,
    fetchSubmissions,
    // ...other submission functions
  };
};

```

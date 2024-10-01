'use client';
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
import { toast } from '../ui/use-toast';

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

function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== typeof obj2 || obj1 == null || obj2 == null) return false;

    if (typeof obj1 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
                return false;
            }
        }

        return true;
    }

    return false;
}

export const AppProvider = ({ children, initialForm }: AppProviderProps): JSX.Element => {
    const { data: session, status } = useSession();
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

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId) {

        } else {
            console.warn("User does not belong to any business.");
        }
    }, [session, status]);

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
        setElements((prev) => prev.filter((element) => element.id !== id));
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
            const response = await fetch(`/api/forms/share_url/${shareUrl}/public`);
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
    ]);

    const contextValue: AppContextType = useMemo(() => ({
        selectors,
        data,
        actions,
    }), [selectors, data, actions]);

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

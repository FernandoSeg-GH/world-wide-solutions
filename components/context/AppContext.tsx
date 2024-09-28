'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
    ReactNode,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { useSession } from 'next-auth/react';
import { FormElementInstance, Form, AppContextType, FetchError, Submission } from '@/types';
import { useFetchForms } from '../hooks/useFetchForms';
import { toast } from '../ui/use-toast';

// Create Context
export const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use the AppContext
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
    initialForm?: Form; // Optional initial form, useful for pre-loading
}

// Helper function to deep compare two objects
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
    const [businessId, setBusinessId] = useState<number | undefined>(undefined);
    const { forms, isLoading: formsLoading, error: formsError } = useFetchForms(businessId);

    const [form, setFormState] = useState<Form | null>(initialForm || null);
    const [formName, setFormName] = useState<string>(initialForm?.name || '');
    const [elements, setElements] = useState<FormElementInstance[]>(initialForm?.fields || []);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const formInitializedRef = useRef(false); // Ref to track initialization

    // Effect to set businessId from session
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId) {
            setBusinessId(session.user.businessId);
        }
    }, [session, status]);

    // Handlers
    const handleFormNameChange = useCallback((newName: string) => {
        setFormName(newName);
        setUnsavedChanges(true);
    }, []);

    // Inside AppProvider

    const setForm = useCallback((newForm: Form | null) => {
        console.log('Attempting to set form:', newForm);
        setFormState((prevForm) => {
            if (deepEqual(prevForm, newForm)) {
                console.log('No changes detected in form. Skipping state update.');
                return prevForm; // No change, prevent state update
            }
            // Update related states within the state setter to maintain consistency
            if (newForm) {
                console.log('Updating formName and elements based on new form data.');
                setFormName(newForm.name);
                setElements(newForm.fields);
                setUnsavedChanges(true);
            } else {
                console.log('Resetting formName and elements as newForm is null.');
                setFormName('');
                setElements([]);
                setUnsavedChanges(true);
            }
            return newForm;
        });
    }, []); // No dependencies


    // Effect to initialize form and elements from fetched forms once
    useEffect(() => {
        if (forms.length > 0 && !initialForm && !formInitializedRef.current) {
            const fetchedForm = forms[0];
            setForm(fetchedForm); // Calls setForm
            formInitializedRef.current = true; // Prevent running again
        }
    }, [forms, initialForm, setForm]);

    const saveForm = useCallback(async () => {
        if (!form) {
            toast({ title: 'Error', description: 'No form to save.', variant: 'destructive' });
            return;
        }
        try {
            console.log('Elements before saving:', elements);

            setLoading(true);

            const response = await fetch('/api/forms/save-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                throw new Error(errorText || 'Error saving form.');
            }

            const result = await response.json();
            // Optionally, update form state with result
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
            // Optionally, update form state with result
            toast({
                title: `Success`,
                description: `Form has been ${action === 'publish' ? 'published' : 'unpublished'}.`,
            });
            // Update form state
            setForm(form ? { ...form, published: action === 'publish' } : form);
            window.location.reload(); // Force refresh after publishing
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

            // Optionally, refresh forms list
            // If using SWR or similar, you can trigger a revalidation
            // For now, we'll just reload the page
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

    const fetchSubmissions = useCallback(async (shareURL: string) => {
        console.log('Fetching submissions for shareURL:', shareURL);
        try {
            const response = await fetch(`/api/forms/share_url/${shareURL}/submissions`);
            if (!response.ok) {
                const errorData = await response.text();  // log the raw error data for debugging
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
                title: 'Error',
                description: `Failed to fetch submissions: ${error.message}`,
                variant: 'destructive',
            });
            console.error('Fetch Submissions Error:', error);
        }
    }, []);


    // Effect to fetch submissions when form changes
    useEffect(() => {
        if (form) {
            fetchSubmissions(form.shareURL);
        }
    }, [form, fetchSubmissions]);

    // Memoize selectors, data, and actions separately to reduce dependencies
    const selectors = useMemo(() => ({
        setFormName,
        setElements,
        setSelectedElement,
        handleFormNameChange,
        setUnsavedChanges,
        setForm,
        setSubmissions,
    }), [setFormName, setElements, setSelectedElement, handleFormNameChange, setUnsavedChanges, setForm, setSubmissions]);

    const data = useMemo(() => ({
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
    }), [formName, elements, selectedElement, unsavedChanges, loading, form, forms, formsLoading, formsError, submissions]);

    const actions = useMemo(() => ({
        saveForm,
        publishForm,
        addElement,
        removeElement,
        updateElement,
        deleteForm,
        fetchSubmissions,
    }), [saveForm, publishForm, addElement, removeElement, updateElement, deleteForm, fetchSubmissions]);

    const contextValue: AppContextType = useMemo(() => ({
        selectors,
        data,
        actions,
    }), [selectors, data, actions]);

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

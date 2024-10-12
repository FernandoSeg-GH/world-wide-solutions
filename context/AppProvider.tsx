

'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useMemo,
} from 'react';
import { useSession } from 'next-auth/react';
import { Form, AppContextType, SubscriptionPlan, Business } from '@/types';
import { useFormState } from '@/hooks/forms/useFormState';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { useGodMode } from '@/hooks/useGodMode';
import { useBusiness } from '@/hooks/business/useBusiness';
import { useLayout } from '@/hooks/useLayout';

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
    const { data: session } = useSession();
    const layoutState = useLayout();
    const formState = useFormState(initialForm);
    const submissionState = useSubmissions();
    const { godMode, toggleGodMode } = useGodMode();
    const {
        createBusiness,
        fetchSubscriptionPlans,
        subscriptionPlans,
        getAllBusinesses,
        getBusinessById,
        editBusiness,
        deleteBusiness,
        businesses,
        business,
        loading: businessLoading,
    } = useBusiness();


    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(
            formState.loading ||
            submissionState.loading ||
            businessLoading
        );
    }, [formState.loading, submissionState.loading, businessLoading]);


    useEffect(() => {
        if (formState.forms.length > 0 && !initialForm && !formState.formInitializedRef.current) {
            formState.setForm(formState.forms[0]);
            formState.formInitializedRef.current = true;
        }
    }, [formState.forms, initialForm, formState.setForm]);


    useEffect(() => {
        if (formState.form) {
            submissionState.fetchSubmissions(formState.form.shareURL);
        }
    }, [formState.form, submissionState.fetchSubmissions]);

    const selectors = useMemo(() => ({
        setError,
        setLoading,
        setFormName: formState.setFormName,
        setElements: formState.setElements,
        setSelectedElement: formState.setSelectedElement,
        handleFormNameChange: formState.handleFormNameChange,
        setUnsavedChanges: formState.setUnsavedChanges,
        setForms: formState.setForms,
        setForm: formState.setForm,
        setSubmissions: submissionState.setSubmissions,
    }), [setError, setLoading, formState, submissionState]);

    const data = useMemo(() => ({
        ...layoutState,
        ...formState,
        ...submissionState,
        subscriptionPlans,
        businesses,
        business,
        godMode,
        loading,
        error,
    }), [
        layoutState,
        formState,
        submissionState,
        subscriptionPlans,
        businesses,
        business,
        godMode,
        loading,
        error,
    ]);

    const actions = useMemo(() => ({
        createForm: formState.createForm,
        saveForm: formState.saveForm,
        publishForm: formState.publishForm,
        addElement: formState.addElement,
        removeElement: formState.removeElement,
        updateElement: formState.updateElement,
        deleteForm: formState.deleteForm,
        fetchFormsByBusinessId: formState.fetchFormsByBusinessId,
        fetchAllForms: formState.fetchAllForms,
        fetchFormByShareUrl: formState.fetchFormByShareUrl,
        fetchFormByShareUrlPublic: formState.fetchFormByShareUrlPublic,
        fetchSubmissions: submissionState.fetchSubmissions,
        getFormSubmissionByCaseId: submissionState.getFormSubmissionByCaseId,
        getMissingFields: submissionState.getMissingFields,
        fetchClientSubmissions: submissionState.fetchClientSubmissions,
        createBusiness,
        fetchSubscriptionPlans,
        getAllBusinesses,
        getBusinessById,
        editBusiness,
        deleteBusiness,
        toggleGodMode,
        switchSection: layoutState.switchSection,
    }), [
        formState,
        submissionState,
        toggleGodMode,
        createBusiness,
        fetchSubscriptionPlans,
        getAllBusinesses,
        getBusinessById,
        editBusiness,
        deleteBusiness,
        layoutState.switchSection,
    ]);

    const contextValue: AppContextType = useMemo(() => ({
        selectors,
        data,
        actions,
    }), [selectors, data, actions]);

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};



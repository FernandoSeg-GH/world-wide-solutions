"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { Form, AppContextType } from "@/types";
import { useFormState } from "@/hooks/forms/useFormState";
import { useSubmissions } from "@/hooks/forms/useSubmissions";
import { useGodMode } from "@/hooks/user/useGodMode";
import { useBusiness } from "@/hooks/business/useBusiness";
import { useUser } from "@/hooks/user/useUser";
import { useLayout } from "@/hooks/layout/useLayout";
import { MessagesProvider, useMessagesContext } from "@/context/MessagesContext";

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
    initialForm?: Form;
}

export const AppProvider = ({ children, initialForm }: AppProviderProps): JSX.Element => {
    const { data: session } = useSession();

    /* LAYOUT */
    const layoutState = useLayout();

    /* FORM */
    const formState = useFormState(initialForm);

    /* SUBMISSIONS */
    const submissionState = useSubmissions();

    /* GODMODE */
    const { godMode, toggleGodMode } = useGodMode();

    /* BUSINESS */
    const {
        createBusiness,
        fetchSubscriptionPlans,
        subscriptionPlans,
        editBusiness,
        deleteBusiness,
        businesses,
        currentBusiness,
        loading: businessLoading,
        setCurrentBusiness,
        fetchAllBusinesses,
        fetchBusinessById,
    } = useBusiness();

    /* USER */
    const { users, currentUser, loading: userLoading, fetchAllUsers, setCurrentUser, createUser } =
        useUser();

    /* MESSAGES */
    const messageState = useMessagesContext(); // Use the context

    const [loading, setLoadingState] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoadingState(
            formState.loading || submissionState.loading || businessLoading || userLoading
        );
    }, [formState.loading, submissionState.loading, businessLoading, userLoading]);

    useEffect(() => {
        if (
            Array.isArray(formState.forms) &&
            formState.forms.length > 0 &&
            !initialForm &&
            !formState.formInitializedRef.current
        ) {
            formState.setForm(formState.forms[0]);
            formState.formInitializedRef.current = true;
        }
    }, [formState.forms, initialForm, formState.setForm, formState]);

    useEffect(() => {
        if (formState.form && formState.form.businessId) {
            submissionState.fetchSubmissions(formState.form.shareUrl);
        }
    }, [formState.form, submissionState, submissionState.fetchSubmissions]);

    const selectors = useMemo(
        () => ({
            setError,
            setLoading: setLoadingState,
            setFormName: formState.setFormName,
            setElements: formState.setElements,
            setSelectedElement: formState.setSelectedElement,
            handleFormNameChange: formState.handleFormNameChange,
            setUnsavedChanges: formState.setUnsavedChanges,
            setForms: formState.setForms,
            setForm: formState.setForm,
            setSubmissions: submissionState.setSubmissions,
            setCurrentBusiness,
            setCurrentUser,
        }),
        [setError, setLoadingState, formState, submissionState, setCurrentBusiness, setCurrentUser]
    );

    const data = useMemo(
        () => ({
            ...layoutState,
            isExpanded: layoutState.isExpanded,
            formName: formState.formName,
            elements: formState.elements,
            selectedElement: formState.selectedElement,
            unsavedChanges: formState.unsavedChanges,
            loading: loading,
            form: formState.form,
            forms: formState.forms,
            submissions: submissionState.submissions,
            subscriptionPlans,
            businesses,
            business: currentBusiness,
            godMode,
            error,
            currentSection: layoutState.currentSection,
            currentPage: submissionState.currentPage,
            totalPages: submissionState.totalPages,
            currentUser,
            users,
            messages: messageState.messages,
            conversations: messageState.conversations,
        }),
        [
            layoutState,
            formState.formName,
            formState.elements,
            formState.selectedElement,
            formState.unsavedChanges,
            loading,
            formState.form,
            formState.forms,
            submissionState.submissions,
            subscriptionPlans,
            businesses,
            currentBusiness,
            godMode,
            error,
            submissionState.currentPage,
            submissionState.totalPages,
            currentUser,
            users,
            messageState.messages,
            messageState.conversations,
        ]
    );

    const actions = useMemo(
        () => ({
            setIsExpanded: layoutState.setIsExpanded, // Added at top-level
            formActions: {
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
                fetchPublishedFormsByBusinessId: formState.fetchPublishedFormsByBusinessId,
            },
            messageActions: {
                fetchConversations: messageState.fetchConversations,
                fetchMessages: messageState.fetchMessages,
                setConversations: messageState.setConversations,
                setMessages: messageState.setMessages,
                replyToMessage: messageState.replyToMessage,
                sendMessageToUsers: messageState.sendMessageToUsers,
                sendMessage: messageState.sendMessage,
                markAsRead: messageState.markAsRead,
                fetchInboxMessages: messageState.fetchInboxMessages,
            },
            fetchSubmissions: submissionState.fetchSubmissions, // Added at top-level
            fetchAllSubmissions: submissionState.fetchAllSubmissions, // Added at top-level
            updateSubmissionStatus: submissionState.updateSubmissionStatus, // Added at top-level
            getFormSubmissionByCaseId: submissionState.getFormSubmissionByCaseId, // Added at top-level
            fetchSubscriptionPlans,
            createBusiness,
            editBusiness,
            deleteBusiness,
            fetchAllUsers,
            createUser,
            fetchBusinessById,
            fetchAllBusinesses,
            toggleGodMode,
            switchSection: layoutState.switchSection,
        }),
        [
            formState,
            messageState,
            submissionState.fetchSubmissions,
            submissionState.fetchAllSubmissions,
            submissionState.updateSubmissionStatus,
            submissionState.getFormSubmissionByCaseId,
            fetchSubscriptionPlans,
            createBusiness,
            editBusiness,
            deleteBusiness,
            fetchAllUsers,
            createUser,
            fetchBusinessById,
            fetchAllBusinesses,
            layoutState.setIsExpanded,
            layoutState.switchSection,
            toggleGodMode,
        ]
    );

    const contextValue: AppContextType = useMemo(
        () => ({
            selectors,
            data,
            actions,
        }),
        [selectors, data, actions]
    );

    return (
        <MessagesProvider>
            <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
        </MessagesProvider>
    );
};

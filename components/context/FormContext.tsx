"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../ui/use-toast";
import { Form, FormField, FormContextType } from "@/types";

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = (): FormContextType => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
};

interface FormProviderProps {
    form: Form; // Directly passing the form object
    children: React.ReactNode;
}

export const FormProvider = ({ form, children }: FormProviderProps): JSX.Element => {
    const [formName, setFormName] = useState<string>(form.name);
    const [elements, setElements] = useState<FormField[]>(form.fields || []);
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

    useEffect(() => {
        setFormName(form.name);
        const parsedFields: FormField[] = form.fields.map((field) => ({
            ...field,
            extraAttributes: field.extraAttributes || {},
        }));
        setElements(parsedFields);
    }, [form]);

    const handleFormNameChange = (newName: string) => {
        setFormName(newName);
        setUnsavedChanges(true);
    };

    const saveForm = async () => {
        try {
            const response = await fetch("/api/forms/save-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    form_id: form.id,
                    name: formName,
                    fields: elements,
                    share_url: form.shareURL,
                    business_id: form.businessId,

                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error saving form.");
            }

            toast({ title: "Form Saved", description: "Your changes have been saved." });
            setUnsavedChanges(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save form.", variant: "destructive" });
        }
    };

    const publishForm = async (action: "publish" | "unpublish") => {
        try {
            const response = await fetch("/api/forms/publish-unpublish-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ form_id: form.id, action }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Error ${action}ing form.`);
            }

            const status = action === "publish" ? "Published" : "Unpublished";
            toast({ title: `Success`, description: `Form has been ${status.toLowerCase()}.` });
            window.location.reload(); // Force refresh after publishing
        } catch (error) {
            toast({ title: "Error", description: `Something went wrong`, variant: "destructive" });
        }
    };

    if (!form) {
        return <div>Form not available</div>;
    }


    return (
        <FormContext.Provider
            value={{
                formName,
                setFormName,
                elements,
                setElements,
                unsavedChanges,
                loading: false,
                saveForm,
                publishForm,
                handleFormNameChange,
                setUnsavedChanges
            }}
        >
            {children}
        </FormContext.Provider>
    );
};

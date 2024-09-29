'use client';

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElements } from "@/types";
import { Button } from "../ui/button";
import { HiCursorClick } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { useAppContext } from "@/components/context/AppContext";
import { toast } from "../ui/use-toast";

function FormSubmitComponent({ formUrl }: { formUrl: string }) {
    const { data, actions } = useAppContext();
    const { form } = data;
    const { fetchFormByShareUrl } = actions;

    const formValues = useRef<{ [key: string]: string }>({});
    const formErrors = useRef<{ [key: string]: boolean }>({});
    const [renderKey, setRenderKey] = useState(new Date().getTime());
    const [submitted, setSubmitted] = useState(false);
    const [pending, startTransition] = useTransition();

    const validateForm: () => boolean = useCallback(() => {
        if (!form) {
            toast({
                title: "Error",
                description: "Form data is missing.",
                variant: "destructive",
            });
            return false;
        }

        for (const field of form.fields) {
            const actualValue = formValues.current[field.id] || "";
            const valid = FormElements[field.type].validate(field, actualValue);

            if (!valid) {
                formErrors.current[field.id] = true;
            }
        }

        if (Object.keys(formErrors.current).length > 0) {
            return false;
        }

        return true;
    }, [form]);

    const submitValue = useCallback((key: string, value: string) => {
        formValues.current[key] = value;
    }, []);

    const submitForm = async () => {
        formErrors.current = {};
        const validForm = validateForm();
        if (!validForm) {
            setRenderKey(new Date().getTime());
            toast({
                title: "Error",
                description: "Please check the form for errors",
                variant: "destructive",
            });
            return;
        }

        try {
            const jsonContent = JSON.stringify(formValues.current);
            const response = await fetch(`/api/forms/submit-form?formUrl=${formUrl}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: jsonContent }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit the form");
            }

            setSubmitted(true);
            toast({
                title: "Success",
                description: "Form submitted successfully",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Something went wrong while submitting the form",
                variant: "destructive",
            });
        }
    };

    if (submitted) {
        return (
            <div className="flex justify-center w-full h-full items-center p-8">
                <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded">
                    <h1 className="text-2xl font-bold">Form submitted</h1>
                    <p className="text-muted-foreground">
                        Thank you for submitting the form, you can close this page now.
                    </p>
                </div>
            </div>
        );
    }

    if (!form) {
        return <div>Form not found</div>;
    }

    return (
        <div className="flex justify-center w-full h-full items-center p-8">
            <div
                key={renderKey}
                className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded"
            >
                <div className="flex flex-col gap-8">
                    {form.fields.map((element) => {
                        const FormElement = FormElements[element.type].formComponent;
                        return (
                            <FormElement
                                key={element.id}
                                elementInstance={element}
                                submitValue={submitValue}
                                isInvalid={formErrors.current[element.id]}
                                defaultValue={formValues.current[element.id]}
                            />
                        );
                    })}
                </div>
                <Button
                    className="mt-8"
                    onClick={() => {
                        startTransition(submitForm);
                    }}
                    disabled={pending}
                >
                    {!pending && (
                        <>
                            <HiCursorClick className="mr-2" />
                            Submit
                        </>
                    )}
                    {pending && <ImSpinner2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );
}

export default FormSubmitComponent;

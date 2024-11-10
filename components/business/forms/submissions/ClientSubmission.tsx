'use client';

import React, { useEffect, useState, useCallback, useRef, useTransition } from "react";
import { FormElements, Form } from "@/types";
import { Button } from "@/components/ui/button";
import { HiCursorClick } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { useAppContext } from "@/context/AppProvider";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { useFormState } from "@/hooks/forms/useFormState";
import Logo from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

function ClientSubmission({ formUrl }: { formUrl: string }) {
    const { data, actions, selectors: { setForm } } = useAppContext();
    const { form } = data;
    const { data: session } = useSession();
    const { fetchFormByShareUrlPublic } = useFormState();
    const formValues = useRef<{ [key: string]: string }>({});
    const formErrors = useRef<{ [key: string]: boolean }>({});
    const [renderKey, setRenderKey] = useState(new Date().getTime());
    const [pending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const filesRef = useRef<{ [key: string]: File | File[] }>({});
    const handleFileChange = useCallback((fieldId: string, files: File | File[]) => {
        filesRef.current[fieldId] = files;
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user.businessId) {
                const fetchedForm = await fetchFormByShareUrlPublic(formUrl, Number(session.user.businessId));
                if (fetchedForm) {
                    setForm(fetchedForm);
                }
            }
        };
        fetchData();
    }, [formUrl, fetchFormByShareUrlPublic, session?.user.businessId, setForm]);

    useEffect(() => {
        if (isSubmitted) {
            router.push('/dashboard');
        }
    }, [isSubmitted, router]);

    const validateForm = useCallback(() => {
        if (!form || !form.fields) {
            toast({
                title: "Error",
                description: "Form data is missing.",
                variant: "destructive",
            });
            return false;
        }

        formErrors.current = {};

        form.fields.forEach((field) => {
            const actualValue = formValues.current[field.id] || "";
            const validateFn = FormElements?.[field.type]?.validate;

            if (validateFn && !validateFn(field, actualValue)) {
                formErrors.current[field.id] = true;
            }
        });

        return Object.keys(formErrors.current).length === 0;
    }, [form]);

    const submitValue = useCallback((key: string, value: string) => {
        formValues.current[key] = value;
    }, []);

    const resetForm = () => {
        formValues.current = {};
        formErrors.current = {};
        filesRef.current = {};
        setRenderKey(new Date().getTime());
    };

    const submitForm = async () => {
        formErrors.current = {};
        const validForm = validateForm();

        if (!validForm) {
            setRenderKey(new Date().getTime());
            toast({
                title: "Error",
                description: "Please check the form for errors.",
                variant: "destructive",
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', JSON.stringify(formValues.current));

            Object.entries(filesRef.current).forEach(([fieldId, files]) => {
                if (Array.isArray(files)) {
                    files.forEach((file) => formData.append(`files_${fieldId}[]`, file)); // Properly append multiple files with `[]`
                } else if (files instanceof File) {
                    formData.append(`files_${fieldId}`, files); // Append a single file directly
                }
            });

            formData.append('userId', String(session?.user.businessId || 1));

            const response = await fetch(`/api/forms/${session?.user.businessId}/submit?formUrl=${formUrl}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                toast({
                    title: "Error",
                    description: `Failed to submit form: ${errorData}`,
                    variant: "destructive",
                });
                return;
            }

            const result = await response.json();
            resetForm();
            setIsSubmitted(true);
            toast({
                title: 'Success',
                description: 'Form submitted successfully.',
            });
        } catch (error: any) {
            console.error("Submission error:", error);
            toast({
                title: 'Error',
                description: String(error),
                variant: 'destructive',
            });
        }
    };

    const formattedDate = format(new Date(), 'dd MMMM yyyy');

    if (!form) {
        return <div className="flex items-center justify-center w-screen h-screen">
            <Spinner />
        </div>;
    }

    return (
        <div className="flex flex-col justify-start w-full min-h-screen items-center p-8 bg-gray-100 dark:bg-muted">
            <div
                key={renderKey}
                className="max-w-[800px] h-auto flex flex-col gap-4 bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded-md dark:border-gray-300 my-6 dark:bg-white dark:text-black"
            >
                <div className="flex items-center justify-between">
                    <Logo url="/assets/vws-hor.png" width={160} className="" />
                    <div className="flex flex-col items-end justify-end">
                        <h1 className="whitespace-nowrap text-lg font-semibold">Victoria Worldwide Solutions</h1>
                        <p className="text-md">{formattedDate}</p>
                    </div>
                </div>
                <Separator />
                <div className="flex flex-col h-auto gap-8">
                    {form?.fields?.map((element) => {
                        const FormElement = FormElements[element.type]?.formComponent;
                        return FormElement ? (
                            <FormElement
                                key={element.id}
                                elementInstance={element}
                                submitValue={submitValue}
                                isInvalid={!!formErrors.current[element.id]}
                                defaultValue={formValues.current[element.id] || ""}
                                handleFileChange={handleFileChange}
                            />
                        ) : (
                            <p key={element.id} className="text-red-500">
                                Unsupported field type: {element.type}
                            </p>
                        );
                    })}
                </div>
                <Button
                    className="mt-8"
                    onClick={() => startTransition(submitForm)}
                    disabled={pending}
                >
                    {!pending ? (
                        <>
                            <HiCursorClick className="mr-2" />
                            Submit
                        </>
                    ) : (
                        <ImSpinner2 className="animate-spin" />
                    )}
                </Button>
            </div>
        </div>
    );
}

export default ClientSubmission;

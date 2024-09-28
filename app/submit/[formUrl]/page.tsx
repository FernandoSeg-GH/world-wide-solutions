"use client";

import { useEffect, useState } from "react";
import { FormElementInstance } from "@/components/forms/FormElements";
import FormSubmitComponent from "@/components/FormSubmitComponent";
import { useRouter } from "next/router";

export default function SubmitPage({ params }: { params: { formUrl: string } }) {
    const { formUrl } = params;
    const [formContent, setFormContent] = useState<FormElementInstance[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFormContent = async () => {
            try {
                const response = await fetch(`/api/forms/get-form-content?formUrl=${formUrl}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch form content");
                }

                const formData = await response.json();
                setFormContent(formData.fields as FormElementInstance[]);
            } catch (error: any) {
                setError(error.message || "Error fetching form content");
            } finally {
                setLoading(false);
            }
        };

        fetchFormContent();
    }, [formUrl]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!formContent) return <div>Form not found</div>;

    return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}

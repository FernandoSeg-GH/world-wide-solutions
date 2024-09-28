import { useState, useEffect } from 'react';
import { Form } from '@/types';
import { toast } from '@/components/ui/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

export const useFetchFormByUrl = (shareUrl: string) => {
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForm = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/forms/get-form?shareUrl=${shareUrl}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Error fetching form.");
                }
                const formData: Form = await response.json();
                setForm(formData);
            } catch (err: any) {
                setError(err.message || "Failed to load form");
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (shareUrl) {
            fetchForm();
        }
    }, [shareUrl]);

    return { form, loading, error };
};

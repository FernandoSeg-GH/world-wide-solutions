import { useState, useCallback } from 'react';
import { Form } from '@/types';

export const useFormFetch = (shareUrl: string) => {
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchForm = useCallback(async () => {
        try {
            const response = await fetch(`/api/forms/get-form?shareUrl=${shareUrl}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch form');
            }

            const formData = await response.json();


            setForm((prevForm) => {
                if (JSON.stringify(prevForm) !== JSON.stringify(formData)) {
                    console.log('Setting form data:', formData);
                    return formData;
                }
                return prevForm;
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [shareUrl]);

    return { form, loading, error, fetchForm };
};

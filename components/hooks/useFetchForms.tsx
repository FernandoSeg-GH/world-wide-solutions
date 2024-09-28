import { useState, useEffect } from 'react';
import { Form, FetchError } from '@/types';

export const useFetchForms = (businessId: number | undefined) => {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<FetchError | null>(null);

    useEffect(() => {
        if (!businessId) return;

        const fetchForms = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/forms/get-forms?businessId=${businessId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw { message: errorData.message || 'Failed to fetch forms', code: response.status };
                }

                const data = await response.json();
                setForms(data.forms);
            } catch (err: any) {
                setError({ message: err.message || 'Unknown error', code: err.code });
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [businessId]);

    return { forms, isLoading, error };
};

'use client';

import { useEffect, useState } from 'react';
import { Form } from '@/types';

export const useFetchForms = (businessId: number | undefined) => {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [noForms, setNoForms] = useState(false); // New state to track if there are no forms

    useEffect(() => {
        const fetchForms = async () => {
            if (!businessId) return;  // Only fetch if businessId is set

            setIsLoading(true);

            try {
                const response = await fetch(`/api/forms/get-forms?businessId=${businessId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setNoForms(true); // No forms found
                        setForms([]); // Set forms to an empty array
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to fetch forms');
                    }
                } else {
                    const data = await response.json();
                    setForms(data.forms);
                    setNoForms(false); // Reset the noForms state
                }
            } catch (error: any) {
                setError(error.message || 'Error fetching forms');
            } finally {
                setIsLoading(false); // Always end the loading state
            }
        };

        if (businessId) {
            fetchForms();
        }
    }, [businessId]);

    return { forms, isLoading, error, noForms };
};

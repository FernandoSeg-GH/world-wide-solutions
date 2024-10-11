"use client"
import { useState, useEffect } from 'react';
import { Form, FetchError } from '@/types';

export const useFetchForms = (businessId: number) => {
    const [forms, setForms] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        const fetchForms = async () => {
            if (!businessId) {
                setForms([]);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/forms/get-forms`);
                const data = await response.json();
                if (response.ok) {
                    setForms(data.forms);
                } else {
                    setError(data.error);
                }
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, [businessId]);

    return { forms, isLoading, error };
};

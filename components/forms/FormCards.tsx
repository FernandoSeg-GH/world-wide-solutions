'use client';

import { useEffect, useState } from 'react';
import FormCard from './FormCard';
import { Skeleton } from '../ui/skeleton';
import { Form } from '@/types';
import { useSession } from 'next-auth/react';

const FormCards = () => {
    const { data: session, status } = useSession(); // Use session and status
    const [businessId, setBusinessId] = useState<number | undefined>(undefined); // Start with undefined

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId && businessId !== session.user.businessId) {
            // Only set the businessId if it's different from the current value
            setBusinessId(session.user.businessId);
        }
    }, [session?.user?.businessId, businessId, status]);  // Track status in dependencies to prevent unnecessary re-renders

    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchForms() {
            if (!businessId) return;  // Only fetch if businessId is set

            setIsLoading(true);  // Set loading to true when starting the request

            try {
                const response = await fetch(`/api/forms/get-forms?businessId=${businessId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch forms');
                }

                const data = await response.json();
                console.log('froms cards data', data)
                setForms(data.forms);
            } catch (error: any) {
                console.error('Error fetching forms:', error);
                setError(error.message || 'Error fetching forms');
            } finally {
                setIsLoading(false);  // Set loading to false when the request is done
            }
        }

        if (businessId) {
            fetchForms();
        }
    }, [businessId]); // Re-fetch only if businessId changes

    if (isLoading) {
        return (
            <>
                {[1, 2, 3, 4].map((el) => (
                    <Skeleton
                        key={el}
                        className="border-2 border-primary-/20 h-[244px] w-full"
                    />
                ))}
            </>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!forms || forms.length === 0) {
        return (
            <div className="border border-dashed flex items-center justify-center text-center leading-9">
                No forms available.
                <br /> Start creating a Form!
            </div>
        );
    }

    return (
        <>
            {forms.length > 0 && forms.map((form: Form) => (
                <FormCard key={form.id} form={form} />
            ))}
        </>
    );
};

export default FormCards;

'use client';

import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import FormCard from './FormCard';
import { FormProvider } from '@/components/context/FormContext'; // Import FormProvider 
import { useEffect, useState } from 'react';
import { useFetchForms } from '../hooks/useFetchForms';

const FormCards = () => {
    const { data: session, status } = useSession();
    const [businessId, setBusinessId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId && businessId !== session.user.businessId) {
            setBusinessId(session.user.businessId);
        }
    }, [session?.user?.businessId, businessId, status]);

    const { forms, isLoading, error, noForms } = useFetchForms(businessId); // Use the hook here

    if (isLoading) {
        return (
            <>
                {[1, 2, 3, 4].map((el) => (
                    <Skeleton
                        key={el}
                        className="border-2 border-primary-/20 h-[200px] w-full"
                    />
                ))}
            </>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (noForms || (!forms || forms.length === 0)) {
        return (
            <div className="border border-dashed flex items-center justify-center text-center leading-9">
                No forms available.
                <br /> Start creating a Form!
            </div>
        );
    }

    return (
        <>
            {forms.map((form) => (
                <FormProvider key={form.id} form={form}>
                    <FormCard form={form} />
                </FormProvider>
            ))}
        </>
    );
};

export default FormCards;

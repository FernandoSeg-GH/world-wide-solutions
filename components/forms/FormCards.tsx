'use client';

import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import FormCard from './FormCard';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/components/context/AppContext'; // Import new AppContext

const FormCards = () => {
    const { data: session, status } = useSession();
    const { data, selectors } = useAppContext(); // Use the context for forms
    const { forms, formsLoading, formsError } = data; // Access forms data from context

    const [businessId, setBusinessId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId && businessId !== session.user.businessId) {
            setBusinessId(session.user.businessId);
        }
    }, [session?.user?.businessId, businessId, status]);

    if (formsLoading) {
        return (
            <>
                {[1, 2, 3, 4].map((el) => (
                    <Skeleton key={el} className="border-2 border-primary-/20 h-[200px] w-full" />
                ))}
            </>
        );
    }

    if (formsError) {
        // Check if `formsError.message` is a string before rendering
        return <div>{typeof formsError.message === 'string' ? formsError.message : 'An error occurred'}</div>;
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
            {forms.map((form) => (
                <FormCard key={form.id} form={form} />
            ))}
        </>
    );
};

export default FormCards;

'use client';

import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import FormCard from './FormCard';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/components/context/AppContext';

const FormCards = () => {
    const { data: session, status } = useSession();
    const { data, selectors } = useAppContext();
    const { forms, formsLoading, formsError } = data;

    const [businessId, setBusinessId] = useState<number | undefined>(undefined);

    if (formsLoading) {
        return (
            <div>
                {[1, 2, 3, 4].map((el) => (
                    <Skeleton key={el} className="border-2 border-primary-/20 h-[200px] w-full" />
                ))}
            </div>
        );
    }

    if (formsError) {

        return <div>{typeof formsError.message === 'string' ? formsError.message : 'An error occurred'}</div>;
    }


    return (
        <div>
            {forms.length > 0 ? forms.map((form) => (
                <FormCard key={form.id} form={form} />
            )) :
                <div className="border border-dashed flex items-center justify-center text-center leading-9 my-6 p-4">
                    No forms found.
                    <br /> Start creating a Form!
                </div>
            }
        </div>
    );
};

export default FormCards;

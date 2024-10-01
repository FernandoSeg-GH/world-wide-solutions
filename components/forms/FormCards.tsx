'use client';

import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';
import FormCard from './FormCard';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/components/context/AppContext';
import { Form } from '@/types';
import CreateFormBtn from './CreateFormButton';

const FormCards = ({ forms }: { forms: Form[] }) => {

    const { data, selectors } = useAppContext();
    const { loading, error } = data;
    error && console.log('error', error)
    return (
        <div className='w-full  grid grid-cols-1 sm:grid-cols-2  gap-2 md:gap-3 lg:flex lg:flex-row lg:flex-wrap'>
            <CreateFormBtn />
            {loading &&
                [1, 2, 3, 4].map((el) => (
                    <Skeleton key={el} className="border-2 border-primary-/20 h-[200px] w-full" />
                ))

            }

            {forms && forms.map((form) => (
                <FormCard key={form.id} form={form} />
            ))}

        </div>
    );
};

export default FormCards;

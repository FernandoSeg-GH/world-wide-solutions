'use client';

import { Skeleton } from '@/components/ui/skeleton';
import FormCard from './FormCard';
import { useAppContext } from '@/context/AppProvider';
import { Form } from '@/types';
import CreateFormBtn from './CreateFormButton';
import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';

const FormCards = ({ forms }: { forms: Form[] }) => {
    const { data: session } = useSession()
    const { data } = useAppContext();
    const { loading, error } = data;


    return (
        <div className='w-full gap-2 flex flex-row flex-wrap'>
            {!loading && session?.user.role.id !== 1 ?
                <CreateFormBtn /> : null
            }
            {loading ? <Skeleton className="border-2 border-primary-/20 h-[210px] w-full lg:max-w-[448px]" /> : null}
            {forms && forms.length > 0 ? forms.map((form) => (
                <FormCard key={form.id} form={form} />
            )) : null}
        </div>
    );
};

export default FormCards;

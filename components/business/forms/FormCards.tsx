'use client';

import { Skeleton } from '@/components/ui/skeleton';
import FormCard from './FormCard';
import { useAppContext } from '@/context/AppProvider';
import { Form } from '@/types';
import CreateFormBtn from './CreateFormButton';

const FormCards = ({ forms }: { forms: Form[] }) => {

    const { data } = useAppContext();
    const { loading, error } = data;

    return (
        <div className='w-full  grid grid-cols-1 sm:grid-cols-2  gap-2 md:gap-3 lg:flex lg:flex-row lg:flex-wrap'>
            {loading ? null :
                <CreateFormBtn />
            }
            {loading ? <Skeleton className="border-2 border-primary-/20 h-[210px] w-full lg:max-w-[448px]" /> : null}
            {forms ? forms.map((form) => (
                <FormCard key={form.id} form={form} />
            )) : null}
        </div>
    );
};

export default FormCards;

'use client';

import { Skeleton } from '../ui/skeleton';
import FormCard from './FormCard';
import { useAppContext } from '@/components/context/AppContext';
import { Form } from '@/types';
import CreateFormBtn from './CreateFormButton';

const FormCards = ({ forms }: { forms: Form[] }) => {

    const { data } = useAppContext();
    const { loading, error } = data;
    error && console.error('error', error)
    return (
        <div className='w-full  grid grid-cols-1 sm:grid-cols-2  gap-2 md:gap-3 lg:flex lg:flex-row lg:flex-wrap'>
            <CreateFormBtn />
            {/* {loading &&
                [1, 2, 3, 4].map((el) => (
                    <Skeleton key={el} className="border-2 border-primary-/20 h-[200px] w-full" />
                    ))
                    
                    } */}
            {loading ? <Skeleton className="border-2 border-primary-/20 h-[200px] w-full" /> : null}

            {forms && forms.map((form) => (
                <FormCard key={form.id} form={form} />
            ))}

        </div>
    );
};

export default FormCards;

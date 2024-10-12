'use client';

import { Skeleton } from '@/components/ui/skeleton';
import FormCard from '../FormCard';
import { useAppContext } from '@/context/AppProvider';
import { Form } from '@/types';
import CreateFormBtn from '../CreateFormButton';

const SubmissionFormCard = ({ forms }: { forms: Form[] }) => {

    const { data } = useAppContext();
    const { loading, error } = data;
    error && console.error('error', error)
    return loading ? <Skeleton className="border-2 border-primary-/20 h-[210px] w-full" /> :
        <div className="w-full flex flex-col py-8 px-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-semibold mb-6">Pending Forms</h2>
            <div className='w-full  md:grid md:grid-cols-1 sm:grid-cols-2  gap-2 md:gap-3 lg:flex lg:flex-row lg:flex-wrap'>
                {
                    forms && forms.map((form) => (
                        <FormCard key={form.id} form={form} />
                    ))
                }
            </div>
        </div>
};

export default SubmissionFormCard;

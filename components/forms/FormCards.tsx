// components/FormCards.tsx 
import { Form } from '@/types';
import { GetForms } from '@/actions/form';
import { Skeleton } from '../ui/skeleton';
import FormCard from './FormCard'; // Import the FormCard component

// components/FormCards.tsx
const FormCards = async () => {
    const businessId = 3;
    let forms: Form[] = [];

    try {
        forms = await GetForms(businessId);
    } catch (error) {
        console.error('Error fetching forms:', error);
        return <div>Error fetching forms</div>;
    }

    if (!forms || forms.length === 0) {
        return <div className='border border-dashed flex items-center justify-center text-center leading-9'>No forms available.<br /> Start creating a Form!</div>;
    }
    return (
        <>
            {forms && forms.map((form: Form, index) => (
                <FormCard key={index} form={form} />
            ))}
        </>
    );
};


export default FormCards;

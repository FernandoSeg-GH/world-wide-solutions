'use client';

import { useEffect, useState } from 'react';
import FormBuilder from '@/components/forms/FormBuilder';
import { useAppContext } from '@/components/context/AppContext'; // Import useAppContext
import { Form } from '@/types';

const BuilderPage = ({ params }: { params: { shareUrl: string } }) => {
  const { selectors: { setForm }, data: { form } } = useAppContext(); // Get setForm and form from context

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shareUrl } = params;
  useEffect(() => {
    const fetchForm = async () => {
      console.log('Fetching form with shareUrl:', shareUrl);
      try {
        const response = await fetch(`/api/forms/get-form?shareUrl=${shareUrl}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching form:', errorData);
          throw new Error(errorData.message || 'Failed to fetch form');
        }

        const formData: Form = await response.json();
        console.log('Form data fetched:', formData);
        setForm(formData); // Set form in AppProvider's state
      } catch (err: any) {
        console.error('Error in fetchForm:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareUrl, setForm]);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return <FormBuilder />;
};

export default BuilderPage;

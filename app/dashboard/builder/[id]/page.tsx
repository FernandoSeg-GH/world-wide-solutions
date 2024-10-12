'use client';

import { useEffect } from 'react';
import FormBuilder from '@/components/business/forms/FormBuilder';
import { useAppContext } from '@/context/AppProvider';
import { Form } from '@/types';
import Spinner from '@/components/ui/spinner';

const BuilderPage = ({ params }: { params: { shareUrl: string } }) => {
  const {
    actions: { fetchFormByShareUrl },
    data: { form, loading, error },
    selectors: { setForm, setLoading, setError },
  } = useAppContext();

  const { shareUrl } = params;

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        const formData = await fetchFormByShareUrl(shareUrl);
        if (formData as Form) {
          setForm(formData);
        } else {
          setError('Form not found');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error in fetchForm:', err);
        setError(err.message || 'Failed to fetch form');
        setLoading(false);
      }
    };

    fetchFormData();
  }, [shareUrl, fetchFormByShareUrl, setForm, setLoading, setError]);


  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;
  return <FormBuilder formName={form.name} />;
};

export default BuilderPage;

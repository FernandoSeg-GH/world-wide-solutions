'use client';

import { useEffect, useState } from 'react';
import FormBuilder from '@/components/forms/FormBuilder';
import { Form } from '@/types';
import { GetFormById } from '@/actions/form';

const BuilderPage = ({ params }: { params: { shareUrl: string } }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { shareUrl } = params;
  console.log('shareUrl builder page', shareUrl)
  useEffect(() => {
    const fetchForm = async () => {
      try {

        const response = await fetch(`/api/forms/get-form?shareUrl=${shareUrl}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch form');
        }

        const formData = await response.json();
        console.log('formData', formData)
        setForm(formData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareUrl]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return <FormBuilder form={form} />;
};

export default BuilderPage;

'use client';

import { useEffect, useState } from 'react';
import FormBuilder from '@/components/forms/FormBuilder';
import { Form } from '@/types';
import { GetFormById } from '@/actions/form';

const BuilderPage = ({ params }: { params: { id: string } }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const formData = await GetFormById(Number(id));

        setForm(formData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return <FormBuilder form={form} />;
};

export default BuilderPage;

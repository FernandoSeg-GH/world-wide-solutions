// BuilderPage.tsx

'use client';

import React, { useEffect, useState } from 'react';
import FormBuilder from '@/components/forms/FormBuilder';
import { useAppContext } from '@/components/context/AppContext';
import { FormElementInstance } from '@/components/forms/FormElements';

interface BuilderPageProps {
  params: {
    shareUrl: string;
  };
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const { shareUrl } = params;
  const { data, selectors, actions } = useAppContext();
  const { form, elements, selectedElement } = data;
  const { setForm, setElements, setSelectedElement } = selectors;
  const { addElement, removeElement, updateElement } = actions;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/get-form?shareUrl=${shareUrl}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch form');
        }

        const formData = await response.json();
        setForm(formData); // Initialize form in AppContext
        setElements(formData.fields || []); // Initialize elements in AppContext
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [shareUrl, setForm, setElements]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div>
      <FormBuilder />
    </div>
  );
}

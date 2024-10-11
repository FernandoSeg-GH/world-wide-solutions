'use client';
import React, { useEffect, useState } from 'react';
import FormBuilder from '@/components/forms/FormBuilder';
import { useAppContext } from '@/components/context/AppContext';
import Spinner from '@/components/ui/spinner';

interface BuilderPageProps {
  params: {
    shareUrl: string;
  };
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const { shareUrl } = params;
  const { data, selectors, actions } = useAppContext();
  const { form, loading, error } = data;
  const { setForm, setElements } = selectors;
  const { fetchFormByShareUrl } = actions;

  // Fetch the form using the shareUrl and context actions
  useEffect(() => {
    if (shareUrl) {
      fetchFormByShareUrl(shareUrl);
    }
  }, [shareUrl, fetchFormByShareUrl]);

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div>
      <FormBuilder formName={form.name} />
    </div>
  );
}

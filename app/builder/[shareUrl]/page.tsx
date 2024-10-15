'use client';
import React, { useEffect, useState } from 'react';
import FormBuilder from '@/components/business/forms/FormBuilder';
import { useAppContext } from '@/context/AppProvider';
import Spinner from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  useEffect(() => {
    if (shareUrl && session?.user.businessId) {
      fetchFormByShareUrl(shareUrl, session.user.businessId);
    }
  }, [shareUrl, fetchFormByShareUrl, session?.user.businessId]);

  if (loading) return <div className='m-auto flex items-center justify-center h-screen w-screen'><Spinner /></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {form ?
        <FormBuilder formName={form.name} /> :
        <div>Form not found</div>
      }
    </div>
  );
}

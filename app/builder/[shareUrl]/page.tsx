'use client';

import { useEffect } from 'react';
import FormBuilder from '@/components/business/forms/FormBuilder';
import { useAppContext } from '@/context/AppProvider';
import { Form } from '@/types';
import Spinner from '@/components/ui/spinner';
import { useSession } from 'next-auth/react';
import { useFormState } from '@/hooks/forms/useFormState';

const BuilderPage = ({ params }: { params: { shareUrl: string } }) => {
  const { shareUrl } = params;

  return <FormBuilder shareUrl={shareUrl} />;
};

export default BuilderPage;

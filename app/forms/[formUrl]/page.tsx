'use client';
import React, { useEffect } from 'react';
import FormLinkShare from '@/components/business/forms/FormLinkShare';
import VisitBtn from '@/components/VisitBtn';
import { useAppContext } from '@/context/AppProvider';
import SubmissionsTable from '@/components/business/forms/submissions/SubmissionTable';
import { useSession } from 'next-auth/react';
import SubmissionCards from '@/components/business/forms/submissions/SubmissionsCards';

const FormDetailPage = ({ params }: { params: { formUrl: string } }) => {
    const { data: session } = useSession();
    const { formUrl } = params;
    const { data, actions: formActions } = useAppContext();
    const { form, forms, submissions, loading, error } = data;

    useEffect(() => {
        if (formUrl && session?.user.businessId) {
            const fetchFormDetails = async () => {
                try {
                    await formActions.fetchFormByShareUrl(String(formUrl), Number(session.user.businessId));
                } catch (err: any) {
                    console.error('Error fetching form details:', err);
                }
            };
            fetchFormDetails();
        }
    }, [formUrl, formActions.fetchFormByShareUrl, session?.user.businessId]);


    if (loading) return <div>Loading form...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!form) return <div>Form not found</div>;

    const submissionRate = (form.visits ?? 0) > 0
        ? (submissions.length / (form.visits ?? 1)) * 100
        : 0;
    const bounceRate = 100 - submissionRate;
    return (
        <>
            <div className="py-10 border-b border-muted">
                <div className="flex justify-between container">
                    <h1 className="text-4xl font-bold truncate">{form.name}</h1>
                    <VisitBtn shareUrl={String(formUrl)} />
                </div>
            </div>

            <div className="py-4 border-b border-muted">
                <div className="container flex gap-2 items-center justify-between">
                    <FormLinkShare shareUrl={String(formUrl)} />
                </div>
            </div>
            {submissions && forms &&
                <div className="container pt-10">

                    <SubmissionCards submissions={submissions} forms={forms} />
                </div>
            }
        </>
    );
};

export default FormDetailPage;

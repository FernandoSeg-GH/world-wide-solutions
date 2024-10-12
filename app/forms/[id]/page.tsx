'use client';
import React, { useEffect } from 'react';
import FormLinkShare from '@/components/business/forms/FormLinkShare';
import VisitBtn from '@/components/VisitBtn';
import { useAppContext } from '@/context/AppProvider';
import SubmissionsTable from '@/components/business/forms/submissions/SubmissionTable';

const FormDetailPage = ({ params }: { params: { id: string } }) => {
    const { id } = params;

    const { data, actions } = useAppContext();
    const { form, submissions, loading, error } = data;

    useEffect(() => {
        if (id) {
            const fetchFormDetails = async () => {
                try {
                    await actions.fetchFormByShareUrl(id);
                } catch (err: any) {
                    console.error('Error fetching form details:', err);
                }
            };
            fetchFormDetails();
        }
    }, [id, actions]);


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
                    <VisitBtn shareUrl={String(form.shareURL)} />
                </div>
            </div>

            <div className="py-4 border-b border-muted">
                <div className="container flex gap-2 items-center justify-between">
                    <FormLinkShare shareUrl={String(form.shareURL)} />
                </div>
            </div>

            <div className="container pt-10">
                <SubmissionsTable submissions={submissions} form={form} />
            </div>
        </>
    );
};

export default FormDetailPage;

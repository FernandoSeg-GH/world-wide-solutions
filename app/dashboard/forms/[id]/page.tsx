'use client';

import { useEffect, useState } from 'react';
import FormLinkShare from '@/components/forms/FormLinkShare';
import VisitBtn from '@/components/VisitBtn';
import { useAppContext } from '@/components/context/AppContext';
import SubmissionsTable from '@/components/forms/SubmissionTable';
import Spinner from '@/components/ui/spinner';

const FormDetailPage = ({ params }: { params: { id: string } }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = params;

    const { selectors, data, actions } = useAppContext();
    const { setForm, setSubmissions } = selectors;
    const { form, submissions } = data;
    const { fetchSubmissions } = actions;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {

                const formId = Number(id);

                const formDataResponse = await fetch(`/api/forms/${formId}`);
                const formData = await formDataResponse.json();
                setForm(formData);

                await fetchSubmissions(formData.shareURL);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFormDetails();
    }, [id, setForm, fetchSubmissions]);

    if (loading) return <Spinner />;
    if (error) return <div>Error: {error}</div>;
    if (!form) return <div>Form not found</div>;

    const submissionRate = (form.visits ?? 0) > 0
        ? (submissions.length / (form.visits ?? 1)) * 100
        : 0;
    const bounceRate = 100 - submissionRate;

    return (
        <div>
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
        </div>
    );
};

export default FormDetailPage;

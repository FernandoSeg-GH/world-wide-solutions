// FormDetailPage.tsx

'use client';

import React, { useEffect, useState } from 'react';
import FormLinkShare from '@/components/FormLinkShare';
import VisitBtn from '@/components/VisitBtn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/components/context/AppContext';
import { Submission, Form } from '@/types';

const FormDetailPage = ({ params }: { params: { share_url: string } }) => {
    const { share_url } = params; // Get share_url from the params
    const { data, selectors, actions } = useAppContext();
    const { form, forms, formsLoading, formsError, submissions } = data;
    const { setForm } = selectors;
    const { saveForm, publishForm } = actions;

    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);

    // Fetch form details and set in context
    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const formResponse = await fetch(`/api/forms/${share_url}`);
                if (!formResponse.ok) {
                    throw new Error("Error fetching form details");
                }
                const formData = await formResponse.json();

                setForm(formData); // Set form in context
            } catch (err: any) {
                // Optionally, handle this error via toast or another mechanism
                console.error(err.message);
            }
        };

        fetchFormDetails();
    }, [share_url, setForm]);

    // Fetch submissions separately
    useEffect(() => {
        const fetchSubmissions = async () => {
            console.log('share_url', share_url)

            try {
                const submissionsResponse = await fetch(`/api/forms/${share_url}/submissions`);
                if (!submissionsResponse.ok) {
                    throw new Error("Error fetching form submissions");
                }
                if (!submissionsResponse) {
                    return { message: 'Form not found' }
                }
                const submissionsData = await submissionsResponse.json();
                selectors.setSubmissions(submissionsData.submissions); // You might need to add a setter in actions if not present
            } catch (err: any) {
                setErrorSubmissions(err.message);
            } finally {
                setLoadingSubmissions(false);
            }
        };

        fetchSubmissions();
    }, [share_url]);

    if (formsLoading) return <div>Loading form...</div>;
    if (formsError) return <div>Error: {formsError.message}</div>;
    if (!form) return <div>Form not found</div>;

    if (loadingSubmissions) return <div>Loading submissions...</div>;
    if (errorSubmissions) return <div>Error: {errorSubmissions}</div>;

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

function SubmissionsTable({ submissions, form }: { submissions: Submission[], form: Form }) {
    if (!Array.isArray(submissions) || submissions.length === 0) {
        return <div>No submissions found</div>;
    }
    const rows = submissions.map((submission) => {
        const parsedContent = JSON.parse(submission.content);
        return {
            ...parsedContent,
            submittedAt: submission.createdAt,
        };
    });

    const fieldMap = form.fields.reduce((acc: { [key: string]: string }, field) => {
        acc[field.id] = field.extraAttributes?.label || `Field ${field.id}`;
        return acc;
    }, {});

    const fieldKeys = Object.keys(rows[0]).filter((key) => key !== 'submittedAt');

    return (
        <>
            <h1 className="text-2xl font-bold my-4">Submissions</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {fieldKeys.map((fieldKey) => (
                                <TableHead key={fieldKey} className="uppercase">
                                    {fieldMap[fieldKey] || `Field ${fieldKey}`}
                                </TableHead>
                            ))}
                            <TableHead className="uppercase">Submitted At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {fieldKeys.map((key) => (
                                    <TableCell key={key}>{row[key]}</TableCell>
                                ))}
                                <TableCell className="text-muted-foreground text-right">
                                    {row.submittedAt}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

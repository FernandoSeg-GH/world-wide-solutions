'use client';

import { useEffect, useState } from 'react';
import FormLinkShare from '@/components/FormLinkShare';
import VisitBtn from '@/components/VisitBtn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistance } from 'date-fns';
import { Form, Submission } from '@/types';
import { GetFormById, GetFormWithSubmissions } from '@/actions/form';

const FormDetailPage = ({ params }: { params: { id: string } }) => {
    const [form, setForm] = useState<Form | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = params;

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const formData = await GetFormById(Number(id));
                const formSubmissions = await GetFormWithSubmissions(Number(id));

                setSubmissions(Array.isArray(formSubmissions.submissions) ? formSubmissions.submissions : []);
                setForm(formData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFormDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!form) return <div>Form not found</div>;

    const submissionRate = form.visits > 0 ? (form.submissions / form.visits) * 100 : 0;
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

// 'use client';

// import { useEffect, useState } from 'react';
// import FormLinkShare from '@/components/business/forms/FormLinkShare';
// import VisitBtn from '@/components/VisitBtn';
// import { useAppContext } from '@/context/AppProvider';
// import SubmissionsTable from '@/components/business/forms/submissions/SubmissionTable';
// import Spinner from '@/components/ui/spinner';
// import { useSession } from 'next-auth/react';
// import { toast } from '@/components/ui/use-toast';

// const FormDetailPage = ({ params }: { params: { formUrl: string } }) => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const { formUrl } = params;
//     const { data: session } = useSession();
//     const { selectors, data, actions } = useAppContext();
//     const { setForm } = selectors;
//     const { form, submissions } = data;
//     const { fetchSubmissions, fetchFormByShareUrlPublic } = actions;

//     useEffect(() => {
//         const fetchFormDetails = async () => {
//             if (!session?.user?.businessId) {
//                 setError("User business ID not found.");
//                 setLoading(false);
//                 return;
//             }

//             try {

//                 const formData = await fetchFormByShareUrlPublic(formUrl, session.user.businessId);

//                 if (!formData) {
//                     throw new Error("Form data is undefined.");
//                 }

//                 if (!formData.shareUrl) {
//                     throw new Error("Form shareUrl is undefined.");
//                 }

//                 setForm(formData);


//                 await fetchSubmissions(formData.shareUrl, session.user.businessId);
//             } catch (err: any) {
//                 console.error("Error fetching form details:", err);
//                 setError(err.message || "Failed to fetch form details.");
//                 toast({
//                     title: "Error",
//                     description: err.message || "Failed to fetch form details.",
//                     variant: "destructive",
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (session?.user && formUrl) {
//             fetchFormDetails();
//         } else {
//             setLoading(false);
//             setError("User session not found.");
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [formUrl, session?.user?.businessId]);

//     if (loading) return <Spinner />;
//     if (error) return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
//     if (!form) return <div className="text-center mt-4">Form not found.</div>;

//     const submissionRate = (form.visits ?? 0) > 0
//         ? (submissions.length / (form.visits ?? 1)) * 100
//         : 0;
//     const bounceRate = 100 - submissionRate;

//     return (
//         <div>
//             <div className="py-10 border-b border-muted">
//                 <div className="flex justify-between container">
//                     <h1 className="text-4xl font-bold truncate">{form.name}</h1>
//                     <VisitBtn shareUrl={form.shareUrl} />
//                 </div>
//             </div>

//             <div className="py-4 border-b border-muted">
//                 <div className="container flex gap-2 items-center justify-between">
//                     <FormLinkShare shareUrl={form.shareUrl} />
//                 </div>
//             </div>

//             <div className="container pt-10">
//                 <SubmissionsTable submissions={submissions} form={form} />
//             </div>
//         </div>
//     );
// };

// export default FormDetailPage;

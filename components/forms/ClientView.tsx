'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { LuAlertCircle } from 'react-icons/lu';
import { Submission, FormElementInstance, Form } from '@/types';
import SubmissionsTable from './SubmissionTable';
import { useState, useEffect } from 'react';

interface ClientViewProps {
    form: Form;
    submissions: Submission[];
}

export default function ClientView({ form, submissions }: ClientViewProps) {
    const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
    const [isMissingData, setIsMissingData] = useState<boolean>(false);

    useEffect(() => {
        if (submissions.length) {
            const parsedSubmissions = submissions.map(submission => ({
                ...submission,
                content: JSON.parse(submission.content)
            }));
            setUserSubmissions(parsedSubmissions);
        } else {
            setUserSubmissions([]); // Clear if no submissions are available
        }
    }, [submissions]);

    if (!form) return <Skeleton className="min-w-80 min-h-20" />;

    return (
        <div className="w-auto flex flex-col ">
            <h2 className="text-2xl font-semibold w-auto">Your Submissions</h2>
            <div className="my-10 w-auto flex flex-row">
                <div>
                    {isMissingData && (
                        <div className="alert alert-warning flex items-center">
                            <LuAlertCircle />
                            <span className="ml-2">You haven't submitted any form.</span>
                        </div>
                    )}
                </div>
                <div className="w-full">
                    {userSubmissions.length > 0 ? (
                        userSubmissions.map((submission, index) => (
                            <div key={index} className="form-submission my-4 border rounded">
                                {form?.fields.map((field: FormElementInstance) => (
                                    <div key={field.id} className="mb-2">
                                        <label className="font-bold">
                                            {field.extraAttributes?.label || field.id}
                                        </label>
                                        <div>{submission.content[field.id] || 'No data provided'}</div>
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        <p className="border p-16 border-dashed text-center rounded-md m-auto pb-20 ">
                            No submissions found
                        </p>
                    )}

                </div>
            </div>
            <div>
                {form ? (
                    <SubmissionsTable submissions={userSubmissions} form={form} />
                ) : (
                    <Skeleton className="min-h-20 w-full rounded-md" />
                )}
            </div>
        </div>
    );
}


// 'use client';

// import { Skeleton } from "@/components/ui/skeleton";
// import { LuAlertCircle } from 'react-icons/lu';
// import { Submission, FormElementInstance, Form } from '@/types';
// import SubmissionsTable from './SubmissionTable';
// import { useState, useEffect } from 'react';

// interface ClientViewProps {
//     form: Form;
//     submissions: Submission[];
// }

// export default function ClientView({ form, submissions }: ClientViewProps) {
//     const [userSubmissions, setUserSubmissions] = useState<Submission[]>(submissions);
//     const [isMissingData, setIsMissingData] = useState<boolean>(false);
//     console.log('submissions', submissions)
//     useEffect(() => {
//         if (submissions.length) {
//             const parsedSubmissions = submissions.map(submission => ({
//                 ...submission,
//                 content: JSON.parse(submission.content)
//             }));
//             setUserSubmissions(parsedSubmissions);
//         }
//     }, [submissions]);


//     // const checkForMissingData = (submissions: Submission[]) => {
//     //     let hasMissingData = false;
//     //     submissions.forEach((submission) => {
//     //         form?.fields.forEach((field: FormElementInstance) => {
//     //             if (field.extraAttributes?.required && !submission.content[field.id]) {
//     //                 hasMissingData = true;
//     //             }
//     //         });
//     //     });
//     //     setIsMissingData(hasMissingData);
//     // };

//     return (
//         <div className="w-full flex flex-col ">
//             <h2 className="text-2xl font-semibold w-full">Your Forms</h2>
//             <div className="my-10 w-full flex flex-row">
//                 <div>
//                     {isMissingData && (
//                         <div className="alert alert-warning flex items-center">
//                             <LuAlertCircle />
//                             <span className="ml-2">You have missing data in some fields.</span>
//                         </div>
//                     )}
//                 </div>
//                 <div className="w-full">
//                     {!userSubmissions ?
//                         <p className="border p-12 border-dashed text-center rounded-md w-full">
//                             No submissions found
//                         </p>
//                         :
//                         userSubmissions.map((submission, index) => (
//                             <div key={index} className="form-submission my-4 border rounded">
//                                 {form?.fields.map((field: FormElementInstance) => (
//                                     <div key={field.id} className="mb-2">
//                                         <label className="font-bold">
//                                             {field.extraAttributes?.label || field.id}
//                                         </label>
//                                         <div>{submission.content[field.id] || 'No data provided'}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ))
//                     }

//                 </div>
//             </div>
//             <div>
//                 {form ? (
//                     <SubmissionsTable submissions={submissions} form={form} />
//                 ) : (
//                     <Skeleton className="min-h-20 w-full rounded-md" />
//                 )}
//             </div>
//         </div>
//     );
// }

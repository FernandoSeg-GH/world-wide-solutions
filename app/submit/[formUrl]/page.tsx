'use client';

import { useEffect } from "react";
import FormSubmitComponent from "@/components/business/forms/FormSubmitComponent";
import { useAppContext } from "@/context/AppProvider";
import { useSession } from "next-auth/react";
import { useFormState } from "@/hooks/forms/useFormState";
import ClientSubmission from "@/components/business/forms/submissions/ClientSubmission";
import { Header } from "@/components/layout/navbar/Header";

const SubmitPage = ({ params }: { params: { formUrl: string } }) => {
    const { formUrl } = params;
    const { actions: formActions } = useAppContext();
    const { data: session } = useSession()
    const { fetchFormByShareUrlPublic } = useFormState();

    const decodedFormUrl = decodeURIComponent(formUrl);

    // useEffect(() => {
    //     if (session?.user.businessId) {
    //         const fetchData = async () => {
    //             await fetchFormByShareUrlPublic(decodedFormUrl, Number(session.user.businessId));
    //         };
    //         fetchData();
    //     }
    // }, [decodedFormUrl, fetchFormByShareUrlPublic, session?.user.businessId]);

    return <div className="">
        {/* <Header currentSection="" isExpanded /> */}
        <ClientSubmission formUrl={decodedFormUrl} />
    </div>
};

export default SubmitPage;

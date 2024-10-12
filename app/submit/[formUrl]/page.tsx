'use client';

import { useEffect } from "react";
import FormSubmitComponent from "@/components/business/forms/FormSubmitComponent";
import { useAppContext } from "@/context/AppProvider";

const SubmitPage = ({ params }: { params: { formUrl: string } }) => {
    const { formUrl } = params;
    const { data, actions } = useAppContext();
    const { form } = data;

    const { fetchFormByShareUrlPublic, fetchSubmissions } = actions;

    const decodedFormUrl = decodeURIComponent(formUrl);

    useEffect(() => {
        const fetchData = async () => {
            await fetchFormByShareUrlPublic(decodedFormUrl);
        };
        fetchData();

    }, [decodedFormUrl, fetchFormByShareUrlPublic]);

    if (!form) return <div>Form not found</div>;

    return <FormSubmitComponent formUrl={decodedFormUrl} />;
};

export default SubmitPage;

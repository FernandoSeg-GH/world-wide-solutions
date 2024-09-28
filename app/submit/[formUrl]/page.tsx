'use client';

import { useEffect } from "react";
import FormSubmitComponent from "@/components/forms/FormSubmitComponent";
import { useAppContext } from "@/components/context/AppContext";

const SubmitPage = ({ params }: { params: { formUrl: string } }) => {
    const { formUrl } = params;
    const { data, actions } = useAppContext();
    const { form } = data;
    const { fetchFormByShareUrl, fetchSubmissions } = actions;

    useEffect(() => {
        const fetchData = async () => {
            await actions.fetchFormByShareUrl(formUrl);
            await actions.fetchSubmissions(formUrl);
        };

        fetchData();
    }, [formUrl, actions, fetchFormByShareUrl, fetchSubmissions]);

    if (!form) return <div>Form not found</div>;

    return <FormSubmitComponent formUrl={formUrl} />;
};

export default SubmitPage;

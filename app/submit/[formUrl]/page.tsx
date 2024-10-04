'use client';

import { useEffect } from "react";
import FormSubmitComponent from "@/components/forms/FormSubmitComponent";
import { useAppContext } from "@/components/context/AppContext";

const SubmitPage = ({ params }: { params: { formUrl: string } }) => {
    const { formUrl } = params;
    const { data, actions } = useAppContext();
    const { form } = data;

    // Destructure the specific functions you need outside of the `useEffect` hook
    const { fetchFormByShareUrlPublic, fetchSubmissions } = actions;

    // Decode the URL parameter
    const decodedFormUrl = decodeURIComponent(formUrl);

    useEffect(() => {
        const fetchData = async () => {
            await fetchFormByShareUrlPublic(decodedFormUrl); // Use decoded URL
            // await fetchSubmissions(decodedFormUrl); // Use decoded URL
        };

        fetchData(); // Fetch data only once
        // }, [decodedFormUrl, fetchFormByShareUrlPublic, fetchSubmissions]); // Only re-run when `formUrl` changes
    }, [decodedFormUrl, fetchFormByShareUrlPublic]); // Only re-run when `formUrl` changes

    if (!form) return <div>Form not found</div>;

    return <FormSubmitComponent formUrl={decodedFormUrl} />;
};

export default SubmitPage;

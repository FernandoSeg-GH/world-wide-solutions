import { GetFormContentByUrl } from "@/actions/form";
import { FormElementInstance } from "@/components/forms/FormElements";
import FormSubmitComponent from "@/components/FormSubmitComponent";
import React from "react";

async function SubmitPage({
    params,
}: {
    params: {
        formUrl: string;
    };
}) {
    const form = await GetFormContentByUrl(params.formUrl);

    if (!form) {
        throw new Error("form not found");
    }

    const formContent = form.fields as FormElementInstance[];

    return <FormSubmitComponent formUrl={params.formUrl} content={formContent} />;
}

export default SubmitPage;

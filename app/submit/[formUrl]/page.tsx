'use client';

import ClientSubmission from "@/components/business/forms/submissions/ClientSubmission";

const SubmitPage = ({ params }: { params: { formUrl: string } }) => {
    const { formUrl } = params;

    const decodedFormUrl = decodeURIComponent(formUrl);


    return <div className="">
        {/* <Header currentSection="" isExpanded /> */}
        <ClientSubmission formUrl={decodedFormUrl} />
    </div>
};

export default SubmitPage;

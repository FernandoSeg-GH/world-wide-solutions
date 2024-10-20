'use client';

import ClientSubmission from "./submissions/ClientSubmission";
import { useState } from "react";

function FormSubmitComponent({ formUrl }: { formUrl: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const decodedFormUrl = decodeURIComponent(formUrl);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40" >
            <ClientSubmission formUrl={decodedFormUrl} />
            {/* <div className={`flex p-4 h-auto w-full flex-col gap-6 transition-all duration-300 ${isExpanded ? "sm:pl-64" : "sm:pl-14"}`}>

            </div> */}
        </div>
    );
}

export default FormSubmitComponent;

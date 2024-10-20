'use client';

import ClientSubmission from "./submissions/ClientSubmission";
import { useState } from "react";

function FormSubmitComponent({ formUrl }: { formUrl: string }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const decodedFormUrl = decodeURIComponent(formUrl);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40" >
            <ClientSubmission formUrl={decodedFormUrl} />
        </div>
    );
}

export default FormSubmitComponent;

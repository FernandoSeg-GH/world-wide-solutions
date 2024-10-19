// app/forms/[shareUrl]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppProvider";
import { useSession } from "next-auth/react";
import FormCard from "@/components/business/forms/FormCard";
import Spinner from "@/components/ui/spinner";
import { Form } from "@/types";
import { useParams } from "next/navigation";

export default function FormPage() {
    const params = useParams();
    const { shareUrl } = params;
    const { actions, data, selectors } = useAppContext();
    const { formActions } = actions;
    const { form, loading, error, } = data;
    const { data: session } = useSession();
    const { setLoading, setError } = selectors

    const [localLoading, setLocalLoading] = useState<boolean>(true);

    const fetchForm = useCallback(async () => {
        setLocalLoading(true);
        try {
            let fetchedForm: Form | null = null;

            if (session?.user?.businessId) {
                // Fetch form for authenticated users
                fetchedForm = await formActions.fetchFormByShareUrl(
                    String(shareUrl),
                    session.user.businessId
                );
            } else {
                // Fetch public form for unauthenticated users
                fetchedForm = await formActions.fetchFormByShareUrlPublic(
                    String(shareUrl),
                    Number(session?.user?.businessId || 0)
                );
            }

            if (!fetchedForm) {
                setError("Form not found");
            }
        } catch (err) {
            console.error("Error fetching form:", err);
            setError("Error fetching form");
        } finally {
            setLocalLoading(false);
        }
    }, [formActions, session, shareUrl, setError]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    if (localLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <div className="p-4">{error}</div>;
    }

    if (!form) {
        return <div className="p-4">Form not found or not available</div>;
    }

    return (
        <div className="p-4">
            <FormCard form={form} />
        </div>
    );
}

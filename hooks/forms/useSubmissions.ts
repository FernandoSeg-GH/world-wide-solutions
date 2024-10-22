"use client";

import { useState, useCallback } from "react";
import { Form, Submission } from "@/types";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchSubmissions = useCallback(
    async (shareUrl: string, businessId: number): Promise<void> => {
      if (!shareUrl || !businessId) {
        console.error("Share URL or Business ID is undefined.");
        toast({
          title: "Error",
          description: "Share URL or Business ID is undefined.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(
          `/api/forms/${
            session?.user.businessId
          }/share-url/${encodeURIComponent(shareUrl)}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch submissions.");
        }

        const data = await response.json();
        setSubmissions((prev) => [
          ...prev,
          ...(data.submissions as Submission[]),
        ]);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch submissions.",
          variant: "destructive",
        });
      }
    },
    [session?.accessToken]
  );

  const getFormSubmissionByCaseId = useCallback(
    async (caseId: string): Promise<Submission | null> => {
      if (!session) return null;

      try {
        setLoading(true);
        /* TODO: ?? */
        const response = await fetch(
          `/api/forms/get_submission_by_case_id?caseId=${caseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`No submission found for caseId: ${caseId}`);
            return null;
          }
          const errorData = await response.json();
          console.error(
            `Error fetching submission by caseId: ${errorData.message}`
          );
          throw new Error(`Error fetching submission: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.submission) {
          return data.submission as Submission;
        }

        return null;
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to fetch submission: ${error.message}`,
          variant: "destructive",
        });
        console.error("GetFormSubmissionByCaseId Error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const getMissingFields = useCallback(
    async (submission: Submission, form: Form): Promise<string[]> => {
      try {
        if (!form) {
          toast({
            title: "Error",
            description: "Form data is missing.",
            variant: "destructive",
          });
          return [];
        }

        let parsedContent: Record<string, any> = {};

        if (submission.content) {
          try {
            parsedContent = JSON.parse(String(submission.content));
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to parse submission content.",
              variant: "destructive",
            });
            console.error("Parsing Error:", error);
            return [];
          }
        }

        const missing: string[] = [];

        form?.fields?.forEach((field) => {
          const value = parsedContent[field.id];
          const isRequired = field.extraAttributes?.required;

          if (
            isRequired &&
            (value === undefined || value === null || value === "")
          ) {
            const label = field.extraAttributes?.label || `Field ${field.id}`;
            missing.push(label);
          }
        });

        return missing;
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to determine missing fields: ${error.message}`,
          variant: "destructive",
        });
        console.error("GetMissingFields Error:", error);
        return [];
      }
    },
    []
  );

  const fetchClientSubmissions = useCallback(async () => {
    if (!session) return;

    try {
      /* TODO: */
      const response = await fetch(`/api/forms/client-submissions`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: "Access Denied",
            description:
              "You do not have permission to view these submissions.",
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to fetch client submissions");
        }
      }
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Error fetching client submissions:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching your submissions.",
        variant: "destructive",
      });
    }
  }, [session]);

  const fetchAllSubmissions = useCallback(
    async (page: number = 1): Promise<Submission[] | null> => {
      if (!session || !session.accessToken) return null;

      try {
        setLoading(true);
        const businessId = session.user?.businessId;
        if (!businessId) {
          throw new Error("Business ID is missing in session.");
        }

        const response = await fetch(
          `/api/forms/submissions?businessId=${businessId}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error fetching submissions: ${errorData.message}`);
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
        setTotalPages(data.pages || 1);
        setCurrentPage(data.page || 1);
        return data.submissions;
      } catch (error: any) {
        console.error("Failed to fetch all submissions", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching all submissions.",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const fetchSubmissionsByFormUrl = useCallback(
    async (formUrl: string) => {
      const businessId = session?.user.businessId;
      if (!formUrl || !businessId) {
        console.error("Form URL or Business ID is undefined.");
        toast({
          title: "Error",
          description: "Form URL or Business ID is undefined.",
          variant: "destructive",
        });
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(
          `/api/forms/${businessId}/share-url/${encodeURIComponent(
            formUrl
          )}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch submissions.");
        }

        const data = await response.json();
        console.log("Fetched submissions data:", data); // Debugging log
        setSubmissions(data.submissions);
        setTotalPages(data.pages || 1);
        setCurrentPage(data.page || 1);
      } catch (error: any) {
        console.error("Error fetching submissions by form URL:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while fetching submissions by form URL.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  return {
    submissions,
    loading,
    currentPage,
    totalPages,
    fetchSubmissions,
    fetchAllSubmissions,
    setSubmissions,
    getFormSubmissionByCaseId,
    fetchSubmissionsByFormUrl,
    getMissingFields,
    fetchClientSubmissions,
    setLoading,
  };
};

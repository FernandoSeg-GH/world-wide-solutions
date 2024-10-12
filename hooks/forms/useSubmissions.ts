"use client";
import { useState, useCallback } from "react";
import { Form, Submission } from "@/types";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSubmissions = useCallback(
    async (shareUrl: string) => {
      if (session) {
        try {
          const response = await fetch(
            `/api/forms/submissions?shareUrl=${shareUrl}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching submissions: ${response.statusText}`
            );
          }

          const data = await response.json();
          if (data?.submissions) {
            setSubmissions(data.submissions);
          } else {
            console.warn("No submissions found");
          }
        } catch (error) {
          console.error("Failed to fetch submissions", error);
        }
      }
    },
    [session]
  );

  const getFormSubmissionByCaseId = useCallback(
    async (caseId: string): Promise<Submission | null> => {
      if (!session) return null;

      try {
        setLoading(true);

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

        const parsedContent = submission.content;
        const missing: string[] = [];

        form.fields.forEach((field) => {
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

  const fetchFormByShareUrl = useCallback(
    async (shareURL: string): Promise<Form | null> => {
      try {
        setLoading(true);
        const res = await fetch(`/api/forms/share/${shareURL}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          return data;
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch form.",
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching the form.",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  const fetchFormByShareUrlPublic = useCallback(
    async (shareURL: string): Promise<void> => {
      try {
        setLoading(true);
        const res = await fetch(`/api/forms/public/share/${shareURL}`);

        if (res.ok) {
          // Handle public form fetch logic here
        } else {
          const data = await res.json();
          toast({
            title: "Error",
            description: data.message || "Failed to fetch public form.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching the public form.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    submissions,
    loading,
    fetchSubmissions,
    fetchFormByShareUrl,
    fetchFormByShareUrlPublic,
    setSubmissions,
    getFormSubmissionByCaseId,
    getMissingFields,
    fetchClientSubmissions,
    setLoading,
  };
};

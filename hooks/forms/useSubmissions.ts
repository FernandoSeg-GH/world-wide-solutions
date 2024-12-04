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
  const [submissionsForms, setSubmissionsForms] = useState<{
    [key: number]: {
      form: Form;
      submissions: Submission[];
    };
  }>({});

  const fetchSubmissions = useCallback(
    async (shareUrl: string, page = 1): Promise<void> => {
      setSubmissions([]);
      if (!shareUrl) {
        console.error("Share URL is undefined.");
        toast({
          title: "Error",
          description: "Share URL is undefined.",
          variant: "destructive",
        });
        return;
      }

      let endpoint = "";
      const roleId = session?.user.role?.id;

      if (!roleId) {
        console.error("User role ID is undefined in session.");
        toast({
          title: "Error",
          description: "User role information is missing.",
          variant: "destructive",
        });
        return;
      }

      switch (roleId) {
        case 1:
          endpoint = `/api/forms/${
            session?.user.businessId
          }/share-url/${encodeURIComponent(shareUrl)}/submissions?page=${page}`;
          break;
        case 2:
        case 3:
          endpoint = `/api/forms/submissions?page=${page}`;
          break;
        case 4:
          endpoint = `/api/forms/submissions?page=${page}`;
          break;
        default:
          console.error("Invalid role ID");
          toast({
            title: "Error",
            description: "User role is invalid.",
            variant: "destructive",
          });
          return;
      }

      try {
        setLoading(true);
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to fetch submissions: ${errorText}`);
          throw new Error("Failed to fetch submissions.");
        }

        const data = await response.json();
        if (data && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
          setTotalPages(data.pages || 1);
          setCurrentPage(data.page || 1);
        } else {
          console.warn("Submissions data is not an array:", data);
          setSubmissions([]);
        }
      } catch (error: any) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch submissions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, session?.user.businessId, session?.user.role?.id]
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
        setSubmissions(data.submissions || []);
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

  const updateSubmissionStatus = useCallback(
    async (submissionId: number, newStatus: string) => {
      if (!session) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/forms/submissions/status/${submissionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update submission status."
          );
        }

        const data = await response.json();

        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission.id === submissionId
              ? { ...submission, status: data.status }
              : submission
          )
        );

        toast({
          title: "Success",
          description: "Submission status updated successfully.",
        });
      } catch (error: any) {
        console.error("Error updating submission status:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update submission status.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const updateSubmissionContent = useCallback(
    async (
      submissionId: number,
      updatedContent: string,
      formId: number
    ): Promise<void> => {
      if (!session) {
        console.error("User is not authenticated.");
        toast({
          title: "Error",
          description: "You must be logged in to edit submissions.",
          variant: "destructive",
        });
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/forms/submissions/${formId}/edit`, {
          method: "PUT",
          body: JSON.stringify({ content: updatedContent }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update submission.");
        }

        const data = await response.json();

        setSubmissions((prevSubmissions) =>
          prevSubmissions.map((submission) =>
            submission.id === submissionId
              ? { ...submission, content: JSON.parse(updatedContent) }
              : submission
          )
        );

        toast({
          title: "Success",
          description: "Submission updated successfully.",
          variant: "default",
        });
      } catch (error: any) {
        console.error("Error updating submission:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update submission.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const fetchUserSubmissionsWithForms = useCallback(async (): Promise<void> => {
    if (!session || !session.accessToken) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      setLoading(true);

      const formsResponse = await fetch(
        `/api/forms/${session.user.businessId}/published`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (!formsResponse.ok) {
        throw new Error("Failed to fetch forms.");
      }

      const formsData = await formsResponse.json();
      const forms = formsData;

      if (!Array.isArray(forms) || forms.length === 0) {
        console.warn("No forms found or data is invalid:", formsData);
        setLoading(false);
        return;
      }

      const submissionsData = await Promise.all(
        forms.map(async (form: Form) => {
          const response = await fetch(
            `/api/forms/submissions/${form.id}/user`,
            {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          );

          if (!response.ok) {
            console.warn(`Failed to fetch submissions for form ${form.id}.`);
            return { form, submissions: [] };
          }

          const data = await response.json();
          return { form, submissions: data.submissions };
        })
      );

      const submissionsMap = submissionsData.reduce(
        (acc, { form, submissions }) => {
          acc[form.id] = { form, submissions };
          return acc;
        },
        {} as { [key: number]: { form: Form; submissions: Submission[] } }
      );

      setSubmissionsForms(submissionsMap);
    } catch (error: any) {
      console.error("Error fetching user submissions with forms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch forms and submissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    submissions,
    loading,
    currentPage,
    totalPages,
    submissionsForms,
    fetchSubmissions,
    fetchAllSubmissions,
    setSubmissions,
    getFormSubmissionByCaseId,
    fetchSubmissionsByFormUrl,
    getMissingFields,
    fetchClientSubmissions,
    setLoading,
    updateSubmissionStatus,
    updateSubmissionContent,
    fetchUserSubmissionsWithForms,
  };
};

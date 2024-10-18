"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Form, FormElementInstance } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { deepEqual } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useGodMode } from "../user/useGodMode";

export const useFormState = (initialForm?: Form) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [form, setFormState] = useState<Form | null>(initialForm ?? null);
  const [formName, setFormName] = useState<string>(initialForm?.name || "");
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const formInitializedRef = useRef<boolean>(false);
  const { godMode } = useGodMode();

  const [elements, setElements] = useState<FormElementInstance[]>(
    initialForm?.fields || []
  );

  const [selectedElement, setSelectedElement] =
    useState<FormElementInstance | null>(null);

  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormNameChange = useCallback((newName: string) => {
    setFormName(newName);
    setUnsavedChanges(true);
  }, []);

  const setForm = useCallback((newForm: Form | null) => {
    setFormState((prevForm) => {
      if (deepEqual(prevForm, newForm)) {
        return prevForm;
      }

      if (newForm) {
        setFormName(newForm.name);
        setElements(newForm.fields);
        setUnsavedChanges(true);
      } else {
        setFormName("");
        setElements([]);
        setUnsavedChanges(true);
      }
      return newForm;
    });
  }, []);

  const addElement = useCallback(
    (index: number, element: FormElementInstance) => {
      setElements((prev) => {
        const newElements = [...prev];
        newElements.splice(index, 0, element);
        return newElements;
      });
      toast({
        title: "Element Added",
        description: "A new element has been added.",
      });
      setUnsavedChanges(true);
    },
    []
  );

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id));
    toast({
      title: "Element Removed",
      description: "An element has been removed.",
    });
    setUnsavedChanges(true);
  }, []);

  const updateElement = useCallback(
    (id: string, element: FormElementInstance) => {
      setElements((prev) => {
        const newElements = [...prev];
        const index = newElements.findIndex((el) => el.id === id);
        if (index !== -1) {
          newElements[index] = element;
        }
        return newElements;
      });
      toast({
        title: "Element Updated",
        description: "An element has been updated.",
      });
      setUnsavedChanges(true);
    },
    []
  );

  const saveForm = useCallback(async () => {
    if (!form) {
      toast({
        title: "Error",
        description: "No form to save.",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `/api/forms/${session?.user.businessId}/share-url/save-form`,
        {
          // Corrected endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_id: form.id,
            name: formName,
            fields: elements,
            shareUrl: form.shareUrl,
            business_id: session?.user.businessId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error saving form.");
      }

      setUnsavedChanges(false);
      toast({
        title: "Form Saved",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save form.",
        variant: "destructive",
      });
      console.error("Save Form Error:", error);
    } finally {
      setLoading(false);
    }
  }, [form, formName, elements, session]);

  const deleteForm = useCallback(
    async (formId: number) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/form/${formId}`, {
          // Corrected endpoint
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete form");
        }

        toast({
          title: "Form Deleted",
          description:
            "The form and all associated data have been successfully deleted.",
        });

        setForms((prevForms) => prevForms.filter((f) => f.id !== formId));
        if (form?.id === formId) {
          setForm(null);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete the form.",
          variant: "destructive",
        });
        console.error("Error deleting form:", error);
      } finally {
        setLoading(false);
      }
    },
    [form, setForm, setForms]
  );

  const fetchFormByShareUrl = useCallback(
    async (shareUrl: string, businessId: number): Promise<Form | null> => {
      if (!businessId) {
        console.warn("No business id provided to fetch form.");
      }
      try {
        const response = await fetch(
          `/api/forms/share-url/${encodeURIComponent(shareUrl)}/public` // Corrected endpoint
        );
        if (!response.ok) {
          throw new Error("Form not found");
        }
        const formData = await response.json();
        return formData as Form;
      } catch (error) {
        console.error("Error fetching form:", error);
        return null;
      }
    },
    []
  );

  const publishForm = useCallback(
    async (action: "publish" | "unpublish") => {
      if (!form) {
        toast({
          title: "Error",
          description: "No form to publish/unpublish.",
          variant: "destructive",
        });
        return;
      }
      try {
        setLoading(true);

        const response = await fetch("/api/forms/publish", {
          // Corrected endpoint
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form_id: form.id, action }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Error ${action}ing form.`);
        }

        const updatedForm = await response.json();
        setForm({ ...form, published: action === "publish" });

        toast({
          title: `Success`,
          description: `Form has been ${
            action === "publish" ? "published" : "unpublished"
          }.`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Something went wrong`,
          variant: "destructive",
        });
        console.error(`${action} Form Error:`, error);
      } finally {
        setLoading(false);
      }
    },
    [form, setForm]
  );

  const fetchFormByShareUrlPublic = useCallback(
    async (shareUrl: string, businessId: number): Promise<Form | null> => {
      setLoading(true);
      setError(null);
      if (session?.user.businessId) {
        try {
          const response = await fetch(
            `/api/forms/${businessId}/share-url/${encodeURIComponent(
              shareUrl
            )}/public`
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch form");
          }
          const formData = await response.json();
          setForm(formData);
          setElements(formData.fields || []);
          return formData as Form;
        } catch (err: any) {
          console.error("Error in fetchFormByShareUrlPublic:", err);
          setError(err.message);
          return null;
        } finally {
          setLoading(false);
        }
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session?.user.businessId]
  );

  const fetchFormsByBusinessId = useCallback(
    async (businessId: number) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/business/${businessId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          toast({
            title: "Error",
            description:
              data.message || "Failed to fetch forms for this business.",
            variant: "destructive",
          });
          return;
        }
        setForms(data.forms);
      } catch (error) {
        console.error("Error fetching forms for business:", error);
        toast({
          title: "Error",
          description:
            "An error occurred while fetching forms for this business.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  const fetchAllForms = useCallback(async (): Promise<void> => {
    if (session?.user.businessId) {
      try {
        setLoading(true);
        const response =
          session?.user.role.id === 4
            ? await fetch(`/api/admin/forms`)
            : await fetch(`/api/forms/${session.user.businessId}`);

        const data = await response.json();

        if (!response.ok) {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch all forms.",
            variant: "destructive",
          });
          return;
        }
        setForms(data.forms);
      } catch (error) {
        console.error("Error fetching all forms:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching all forms.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [session?.user.businessId, session?.user.role.id]);

  const createForm = useCallback(
    async ({ name, description }: { name: string; description: string }) => {
      try {
        if (!session || !session.accessToken) {
          throw new Error("User is not authenticated");
        }

        const formData = {
          name,
          description,
          business_id: session.user.businessId,
        };

        const response = await fetch(
          `/api/forms/${session.user.businessId}/shar-url/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create form");
        }

        const result = await response.json();
        return {
          formId: result?.form_id,
          shareUrl: result?.shareUrl,
        };
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create form",
          variant: "destructive",
        });
        return null;
      }
    },
    [session]
  );

  return {
    form,
    forms,
    formName,
    elements,
    selectedElement,
    unsavedChanges,
    loading,
    formInitializedRef,
    error,
    createForm,
    setForm,
    setForms,
    setFormName,
    setElements,
    setSelectedElement,
    setUnsavedChanges,
    handleFormNameChange,
    addElement,
    removeElement,
    updateElement,
    saveForm,
    publishForm,
    deleteForm,

    fetchFormsByBusinessId,
    fetchAllForms,
    fetchFormByShareUrl,
    fetchFormByShareUrlPublic,
    setLoading,
    setError,
  };
};

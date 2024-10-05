FormSubimitComponent.tsx:

```tsx
"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElements } from "@/types";
import { Button } from "../ui/button";
import { HiCursorClick } from "react-icons/hi";
import { ImSpinner2 } from "react-icons/im";
import { useAppContext } from "@/components/context/AppContext";
import { toast } from "../ui/use-toast";

function FormSubmitComponent({ formUrl }: { formUrl: string }) {
  const { data, actions } = useAppContext();
  const { form } = data;
  const { fetchFormByShareUrl } = actions;

  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const validateForm: () => boolean = useCallback(() => {
    if (!form) {
      toast({
        title: "Error",
        description: "Form data is missing.",
        variant: "destructive",
      });
      return false;
    }

    for (const field of form.fields) {
      const actualValue = formValues.current[field.id] || "";
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  }, [form]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

  const submitForm = async () => {
    formErrors.current = {};
    const validForm = validateForm();
    if (!validForm) {
      setRenderKey(new Date().getTime());
      toast({
        title: "Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      const response = await fetch(
        `/api/forms/submit-form?formUrl=${formUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: jsonContent }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit the form");
      }

      setSubmitted(true);
      toast({
        title: "Success",
        description: "Form submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong while submitting the form",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex justify-center w-full h-full items-center p-8">
        <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded">
          <h1 className="text-2xl font-bold">Form submitted</h1>
          <p className="text-muted-foreground">
            Thank you for submitting the form, you can close this page now.
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return <div>Form not found</div>;
  }

  return (
    <div className="flex justify-center w-full h-full items-center p-8">
      <div
        key={renderKey}
        className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded"
      >
        <div className="flex flex-col gap-8">
          {form.fields.map((element) => {
            const FormElement = FormElements[element.type].formComponent;
            return (
              <FormElement
                key={element.id}
                elementInstance={element}
                submitValue={submitValue}
                isInvalid={formErrors.current[element.id]}
                defaultValue={formValues.current[element.id]}
              />
            );
          })}
        </div>
        <Button
          className="mt-8"
          onClick={() => {
            startTransition(submitForm);
          }}
          disabled={pending}
        >
          {!pending && (
            <>
              <HiCursorClick className="mr-2" />
              Submit
            </>
          )}
          {pending && <ImSpinner2 className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
}

export default FormSubmitComponent;
```

---

FormBuilder:

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import PreviewDialogBtn from "./PreviewDialogBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "../Designer";
import { Input } from "../ui/input";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import DragOverlayWrapper from "../DragOverlayWrapper";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

function FormBuilder({ formName }: { formName: string }) {
  const {
    selectors: { handleFormNameChange, setSelectedElement },
    data: { unsavedChanges, form, loading },
    actions: {
      saveForm,
      publishForm,
      addElement,
      removeElement,
      updateElement,
    },
  } = useAppContext();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(true); // Local state to track published status
  const toast = useToast();
  const router = useRouter();

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    setSelectedElement(null);
    const readyTimeout = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(readyTimeout);
  }, [setSelectedElement]);

  // Check if the form is published or not
  useEffect(() => {
    if (form && form.published === false) {
      setIsPublished(false);
    } else {
      setIsPublished(true);
    }
  }, [form]);

  const shareUrl = `${window.location.origin}/submit/${encodeURIComponent(
    formName
  )}`;

  return (
    <DndContext sensors={sensors}>
      {!isReady ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <ImSpinner2 className="animate-spin h-12 w-12" />
        </div>
      ) : (
        <main className="flex flex-col w-full min-h-screen">
          <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground mr">Form:</span>
              {isEditingName ? (
                <Input
                  value={formName}
                  onChange={(e) => handleFormNameChange(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  placeholder="Enter your form title"
                  className="bg-gray-100"
                />
              ) : (
                <h2
                  className="truncate font-medium min-w-[190px] p-2 rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => setIsEditingName(true)}
                >
                  {formName}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* {!isPublished && (
                                <span className="text-red-500 font-bold">Unpublished</span>
                            )} */}
              <PreviewDialogBtn />
              <SaveFormBtn unsavedChanges={unsavedChanges} loading={loading} />

              <Button
                variant={!isPublished ? "outline" : "default"}
                className="gap-2"
                onClick={() => {
                  !isPublished
                    ? publishForm("publish")
                    : publishForm("unpublish");
                }}
              >
                {!isPublished ? "Publish" : "Unpublish"}
              </Button>
              {isPublished ? (
                <Button onClick={() => router.push(shareUrl)}>View Form</Button>
              ) : null}
            </div>
          </nav>
          <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[210px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
            <Designer />
          </div>
        </main>
      )}
      <DragOverlayWrapper />
    </DndContext>
  );
}

export default FormBuilder;
```

---

Designer:

```tsx
"use client";

import React, { useState } from "react";
import DesignerSidebar from "./DesignerSidebar";
import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ElementsType, FormElementInstance, FormElements } from "@/types";
import { idGenerator } from "@/lib/idGenerator";
import { Button } from "./ui/button";
import { BiSolidTrash } from "react-icons/bi";
import { useAppContext } from "./context/AppContext";

function Designer() {
  const {
    data: { elements, selectedElement },
    actions: { addElement, removeElement },
    selectors: { setSelectedElement },
  } = useAppContext();

  const droppable = useDroppable({
    id: "designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  });

  useDndMonitor({
    onDragEnd: (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
      const isDroppingOverDesignerDropArea =
        over.data?.current?.isDesignerDropArea;

      const droppingSidebarBtnOverDesignerDropArea =
        isDesignerBtnElement && isDroppingOverDesignerDropArea;

      if (droppingSidebarBtnOverDesignerDropArea) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );

        addElement(elements.length, newElement);
        return;
      }

      const isDroppingOverDesignerElementTopHalf =
        over.data?.current?.isTopHalfDesignerElement;
      const isDroppingOverDesignerElementBottomHalf =
        over.data?.current?.isBottomHalfDesignerElement;
      const isDroppingOverDesignerElement =
        isDroppingOverDesignerElementTopHalf ||
        isDroppingOverDesignerElementBottomHalf;

      const droppingSidebarBtnOverDesignerElement =
        isDesignerBtnElement && isDroppingOverDesignerElement;

      if (droppingSidebarBtnOverDesignerElement) {
        const type = active.data?.current?.type;
        const newElement = FormElements[type as ElementsType].construct(
          idGenerator()
        );

        const overId = over.data?.current?.elementId;
        const overElementIndex = elements.findIndex((el) => el.id === overId);
        if (overElementIndex === -1) {
          throw new Error("element not found");
        }

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, newElement);
        return;
      }

      const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
      const draggingDesignerElementOverAnotherDesignerElement =
        isDroppingOverDesignerElement && isDraggingDesignerElement;

      if (draggingDesignerElementOverAnotherDesignerElement) {
        const activeId = active.data?.current?.elementId;
        const overId = over.data?.current?.elementId;

        const activeElementIndex = elements.findIndex(
          (el) => el.id === activeId
        );
        const overElementIndex = elements.findIndex((el) => el.id === overId);

        if (activeElementIndex === -1 || overElementIndex === -1) {
          throw new Error("element not found");
        }

        const activeElement = { ...elements[activeElementIndex] };
        removeElement(activeId);

        let indexForNewElement = overElementIndex;
        if (isDroppingOverDesignerElementBottomHalf) {
          indexForNewElement = overElementIndex + 1;
        }

        addElement(indexForNewElement, activeElement);
      }
    },
  });

  return (
    <div className="flex w-full h-full">
      <div
        className="p-4 w-full"
        onClick={() => {
          if (selectedElement) setSelectedElement(null);
        }}
      >
        <div
          ref={droppable.setNodeRef}
          className={cn(
            "bg-background max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto",
            droppable.isOver && "ring-4 ring-primary ring-inset"
          )}
        >
          {!droppable.isOver && elements.length === 0 && (
            <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
              Drop here
            </p>
          )}

          {droppable.isOver && elements.length === 0 && (
            <div className="p-4 w-full">
              <div className="h-[120px] rounded-md bg-primary/20"></div>
            </div>
          )}

          {elements.length > 0 && (
            <div className="flex flex-col w-full gap-2 p-4">
              {elements.map((element) => (
                <DesignerElementWrapper key={element.id} element={element} />
              ))}
            </div>
          )}
        </div>
      </div>
      <DesignerSidebar />
    </div>
  );
}

export interface DesignerElementWrapperProps {
  element: FormElementInstance;
}

function DesignerElementWrapper({ element }: DesignerElementWrapperProps) {
  const {
    actions: { removeElement },
    data: { selectedElement },
    selectors: { setSelectedElement },
  } = useAppContext();

  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

  const DesignerElement = FormElements[element.type].designerComponent;

  return (
    <div
      className="relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedElement(element);
      }}
    >
      {mouseIsOver && (
        <>
          <div className="absolute right-0 h-full">
            <Button
              className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
              variant={"outline"}
              onClick={(e) => {
                e.stopPropagation();
                removeElement(element.id);
              }}
            >
              <BiSolidTrash className="h-6 w-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
            <p className="text-muted-foreground text-sm">
              Click for properties or drag to move
            </p>
          </div>
        </>
      )}
      <div className="flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none opacity-100">
        <DesignerElement elementInstance={element} />
      </div>
    </div>
  );
}

export default Designer;
```

---

AppContext:

```tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import {
  FormElementInstance,
  Form,
  AppContextType,
  FetchError,
  Submission,
  SubscriptionPlan,
} from "@/types";
import { useFetchForms } from "../hooks/useFetchForms";
import { toast } from "../ui/use-toast";

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
  initialForm?: Form;
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== typeof obj2 || obj1 == null || obj2 == null) return false;

  if (typeof obj1 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export const AppProvider = ({
  children,
  initialForm,
}: AppProviderProps): JSX.Element => {
  const { data: session, status } = useSession();
  const [form, setFormState] = useState<Form | null>(initialForm ?? null);
  const [forms, setForms] = useState<Form[]>([]);

  const [formName, setFormName] = useState<string>(initialForm?.name || "");
  const [elements, setElements] = useState<FormElementInstance[]>(
    initialForm?.fields || []
  );
  const [selectedElement, setSelectedElement] =
    useState<FormElementInstance | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.businessId) {
    } else {
      console.warn("User does not belong to any business.");
    }
  }, [session, status]);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/business/subscription");
      const data: SubscriptionPlan[] = await res.json();

      if (res.ok) {
        setSubscriptionPlans(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch subscription plans.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching subscription plans.",
        variant: "destructive",
      });
    }
  }, []);

  // Create a business
  const createBusiness = useCallback(async (businessData: any) => {
    try {
      setLoading(true);

      const res = await fetch("/api/business/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businessData),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: "Business created successfully.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create business.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the business.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const createForm = useCallback(
    async ({ name, description }: { name: string; description: string }) => {
      try {
        if (!session || !session.accessToken) {
          throw new Error("User is not authenticated");
        }

        const response = await fetch("/api/forms/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            name,
            description,
            business_id: session.user.businessId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create form");
        }

        const result = await response.json();
        return {
          formId: result?.form_id,
          shareURL: result?.share_url,
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
    [session?.user.businessId, session]
  );

  const fetchForms = useCallback(
    async (businessId: number) => {
      if (!businessId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/forms/get-forms?businessId=${businessId}`
        );
        const data = await response.json();

        if (response.ok) {
          setForms(data.forms); // Ensure the forms state is updated
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch forms.");
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  ); // Add only necessary dependencies

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
      const response = await fetch("/api/forms/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form.id,
          name: formName,
          fields: elements,
          share_url: form.shareURL,
          business_id: session?.user.businessId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error saving form.");
      }

      const result = await response.json();

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
  }, [form, formName, elements]);

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

        const response = await fetch("/api/forms/publish-unpublish-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form_id: form.id, action }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Error ${action}ing form.`);
        }

        const result = await response.json();
        setForm(form ? { ...form, published: action === "publish" } : form);

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
        variant: "default",
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
      variant: "default",
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
        variant: "default",
      });
      setUnsavedChanges(true);
    },
    []
  );

  const deleteForm = useCallback(async (formId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/delete?formId=${formId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete form");
      }

      toast({
        title: "Form Deleted",
        description:
          "The form and all associated data have been successfully deleted.",
      });

      window.location.reload();
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
  }, []);

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
    [session?.accessToken]
  );

  const fetchFormByShareUrl = async (
    shareUrl: string
  ): Promise<Form | null> => {
    try {
      const response = await fetch(`/api/forms/share_url/${shareUrl}/public`);
      if (!response.ok) {
        throw new Error("Form not found");
      }
      const formData = await response.json();
      return formData as Form;
    } catch (error) {
      console.error("Error fetching form:", error);
      return null;
    }
  };

  const fetchFormByShareUrlPublic = useCallback(async (shareUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/forms/get-form-public?shareUrl=${shareUrl}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch form");
      }
      const formData = await response.json();
      setFormState(formData); // Set the form in the state
      setElements(formData.fields || []);
      return formData; // Return the fetched form
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFormSubmissionByCaseId = useCallback(
    async (caseId: string): Promise<Submission | null> => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/forms/get_submission_by_case_id?caseId=${caseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.accessToken}`,
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
    async (submission: Submission): Promise<string[]> => {
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
    [form]
  );

  const fetchClientSubmissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/client-submissions`);
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
  }, []);

  useEffect(() => {
    if (
      forms &&
      forms.length > 0 &&
      !initialForm &&
      !formInitializedRef.current
    ) {
      const fetchedForm = forms[0];
      setForm(fetchedForm);
      formInitializedRef.current = true;
    }
  }, [forms, initialForm, setForm]);

  useEffect(() => {
    if (form) {
      setLoading(true);
      fetchSubmissions(form.shareURL).finally(() => setLoading(false)); // Ensure async logic doesn't cause loops
    } else {
      setLoading(false);
    }
  }, [form, fetchSubmissions]); // Ensure only necessary dependencies are included

  const selectors = useMemo(
    () => ({
      setFormName,
      setError,
      setForms,
      setForm,
      setElements,
      setSelectedElement,
      handleFormNameChange,
      setUnsavedChanges,
      setSubmissions,
      setLoading,
    }),
    [
      setFormName,
      setError,
      setForms,
      setForm,
      setElements,
      setSelectedElement,
      handleFormNameChange,
      setUnsavedChanges,
      setSubmissions,
      setLoading,
    ]
  );

  const data = useMemo(
    () => ({
      formName,
      elements,
      selectedElement,
      loading,
      error,
      unsavedChanges,
      form,
      forms,
      submissions,
      subscriptionPlans,
    }),
    [
      formName,
      elements,
      selectedElement,
      loading,
      error,
      unsavedChanges,
      form,
      forms,
      submissions,
      subscriptionPlans,
    ]
  );

  const actions = useMemo(
    () => ({
      fetchForms,
      fetchClientSubmissions,
      fetchSubscriptionPlans,
      createBusiness,
      createForm,
      saveForm,
      publishForm,
      addElement,
      removeElement,
      updateElement,
      deleteForm,
      fetchSubmissions,
      fetchFormByShareUrl,
      fetchFormByShareUrlPublic,
      getFormSubmissionByCaseId,
      getMissingFields,
    }),
    [
      fetchForms,
      fetchClientSubmissions,
      fetchSubscriptionPlans,
      createBusiness,
      createForm,
      saveForm,
      publishForm,
      addElement,
      removeElement,
      updateElement,
      deleteForm,
      fetchSubmissions,
      fetchFormByShareUrl,
      fetchFormByShareUrlPublic,
      getFormSubmissionByCaseId,
      getMissingFields,
    ]
  );

  const contextValue: AppContextType = useMemo(
    () => ({
      selectors,
      data,
      actions,
    }),
    [selectors, data, actions]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
```

---

FormElementSidebar

```tsx
import React from "react";
import SidebarBtnElement from "@/components/SidebarBtnElement";
import { FormElements } from "@/components/forms/FormElements";
import { Separator } from "@/components/ui/separator";

function FormElementsSidebar() {
  return (
    <div>
      <p className="text-sm text-foreground/70">Drag and drop elements</p>
      <Separator className="my-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
        <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
          Layout elements
        </p>
        <SidebarBtnElement formElement={FormElements.TitleField} />
        <SidebarBtnElement formElement={FormElements.SubTitleField} />
        <SidebarBtnElement formElement={FormElements.ParagraphField} />
        <SidebarBtnElement formElement={FormElements.SeparatorField} />
        <SidebarBtnElement formElement={FormElements.SpacerField} />

        <p className="text-sm text-muted-foreground col-span-1 md:col-span-2 my-2 place-self-start">
          Form elements
        </p>
        <SidebarBtnElement formElement={FormElements.TextField} />
        <SidebarBtnElement formElement={FormElements.TelephoneField} />
        <SidebarBtnElement formElement={FormElements.NumberField} />
        <SidebarBtnElement formElement={FormElements.TextAreaField} />
        <SidebarBtnElement formElement={FormElements.DateField} />
        <SidebarBtnElement formElement={FormElements.SelectField} />
        <SidebarBtnElement formElement={FormElements.CheckboxField} />
      </div>
    </div>
  );
}

export default FormElementsSidebar;
```

---

```tsx
import { CheckboxFieldFormElement } from "@/components/fields/CheckboxField";
import { DateFieldFormElement } from "@/components/fields/DateField";
import { NumberFieldFormElement } from "@/components/fields/NumberField";
import { ParagraphFieldFormElement } from "@/components/fields/ParagraphField";
import { SelectFieldFormElement } from "@/components/fields/SelectField";
import { SeparatorFieldFormElement } from "@/components/fields/SeparatorField";
import { SpacerFieldFormElement } from "@/components/fields/SpacerField";
import { SubTitleFieldFormElement } from "@/components/fields/SubTitleField";
import { TextAreaFormElement } from "@/components/fields/TextAreaField";
import { TextFieldFormElement } from "@/components/fields/TextField";
import { TitleFieldFormElement } from "@/components/fields/TitleField";
import { TelephoneFieldFormElement } from "@/components/fields/TelephoneField";
import { Dispatch, SetStateAction } from "react";

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: string;
  features: string[] | null;
}

export interface Form {
  id: number;
  name: string;
  fields: FormElementInstance[];
  shareURL: string;
  businessId?: number;
  description?: string;
  extraAttributes?: Record<string, any>;
  createdAt?: string;
  published?: boolean;
  visits?: number;
  submissionsCount?: number;
  FormSubmissions?: Submission[];
}

export interface FormField {
  id: string;
  type: ElementsType;
  label?: string;
  required?: boolean;
  extraAttributes: {
    label?: string;
    required?: boolean;
    placeHolder?: string;
    helperText?: string;
    options?: { label: string; value: string }[];
    rows?: number;
    [key: string]: any;
  };
}

export interface FormContextType {
  formName: string;
  elements: FormField[];
  setElements: (elements: FormField[]) => void;
  setFormName: (name: string) => void;
  unsavedChanges: boolean;
  saveForm: () => Promise<void>;
  publishForm: (action: "publish" | "unpublish") => Promise<void>;
  handleFormNameChange: (newName: string) => void;
  setUnsavedChanges: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
}

export interface Submission {
  id: number;
  formUrl: string;
  formId?: number;
  content: any;
  createdAt: string;
}

export type ElementsType =
  | "TextField"
  | "TitleField"
  | "SubTitleField"
  | "ParagraphField"
  | "SeparatorField"
  | "SpacerField"
  | "NumberField"
  | "TextAreaField"
  | "DateField"
  | "SelectField"
  | "TelephoneField"
  | "CheckboxField";

export type SubmitFunction = (key: string, value: string) => void;

export type FormElement = {
  type: ElementsType;

  construct: (id: string) => FormElementInstance;

  designerBtnElement: {
    icon: React.ElementType;
    label: string;
  };

  designerComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;
  formComponent: React.FC<{
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
  }>;
  propertiesComponent: React.FC<{
    elementInstance: FormElementInstance;
  }>;

  validate: (formElement: FormElementInstance, currentValue: string) => boolean;
};

export type FormElementInstance = FormField;

type FormElementsType = {
  [key in ElementsType]: FormElement;
};
export const FormElements: FormElementsType = {
  TextField: TextFieldFormElement,
  TitleField: TitleFieldFormElement,
  SubTitleField: SubTitleFieldFormElement,
  ParagraphField: ParagraphFieldFormElement,
  SeparatorField: SeparatorFieldFormElement,
  SpacerField: SpacerFieldFormElement,
  NumberField: NumberFieldFormElement,
  TextAreaField: TextAreaFormElement,
  DateField: DateFieldFormElement,
  SelectField: SelectFieldFormElement,
  CheckboxField: CheckboxFieldFormElement,
  TelephoneField: TelephoneFieldFormElement,
};

export interface FetchError {
  message: string;
  code?: number;
}

export interface AppContextType {
  selectors: {
    setFormName: (name: string) => void;
    setElements: (elements: FormElementInstance[]) => void;
    setSelectedElement: (element: FormElementInstance | null) => void;
    handleFormNameChange: (newName: string) => void;
    setUnsavedChanges: (flag: boolean) => void;
    setSubmissions: (submissions: Submission[]) => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setForms: (forms: Form[] | []) => void;
    setForm: (form: Form | null) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };
  data: {
    formName: string;
    elements: FormElementInstance[];
    selectedElement: FormElementInstance | null;
    unsavedChanges: boolean;
    loading: boolean;
    form: Form | null;
    forms: Form[];
    submissions: Submission[];
    subscriptionPlans: SubscriptionPlan[];
    error: string | null;
  };
  actions: {
    createForm: (newForm: {
      name: string;
      description: string;
    }) => Promise<{ formId: number; shareURL: string } | null>;
    createBusiness: (businessData: any) => Promise<boolean>;
    fetchForms: (businessId: number) => Promise<void>;
    fetchSubmissions: (shareURL: string) => Promise<void>;
    fetchFormByShareUrl: (shareURL: string) => Promise<Form | null>;
    fetchFormByShareUrlPublic: (shareURL: string) => Promise<void>;
    fetchClientSubmissions: (userId: number) => Promise<void>;
    fetchSubscriptionPlans: () => Promise<void>;
    saveForm: () => Promise<void>;
    publishForm: (action: "publish" | "unpublish") => Promise<void>;
    addElement: (index: number, element: FormElementInstance) => void;
    removeElement: (id: string) => void;
    updateElement: (id: string, element: FormElementInstance) => void;
    deleteForm: (formId: number) => Promise<void>;
    getFormSubmissionByCaseId: (caseId: string) => Promise<Submission | null>;
    getMissingFields: (submission: Submission) => Promise<string[]>;
  };
}
```

```json
[
  {
    "extraAttributes": { "title": "Patient Personal Information" },
    "id": "1938",
    "type": "TitleField"
  },
  {
    "id": "9670",
    "type": "ParagraphField",
    "extraAttributes": {
      "text": "Personal data information is requested for the purpose of recollecting additional accident data in accordance with the terms of service under the subrogation clause, reason why you may be contacted by VWS."
    }
  },
  { "id": "2159", "type": "SeparatorField", "extraAttributes": {} },
  {
    "id": "6665",
    "type": "TextField",
    "extraAttributes": {
      "label": "Name",
      "helperText": "",
      "placeHolder": "Your first name",
      "required": true
    }
  },
  {
    "id": "4357",
    "type": "TextField",
    "extraAttributes": {
      "label": "Last Name",
      "helperText": "",
      "placeHolder": "Your last name",
      "required": true
    }
  },
  {
    "id": "2710",
    "type": "NumberField",
    "extraAttributes": {
      "label": "Age",
      "helperText": "Helper text",
      "placeHolder": "",
      "required": false
    }
  },
  {
    "id": "249",
    "type": "SelectField",
    "extraAttributes": {
      "label": "Country of Residence",
      "helperText": "",
      "placeHolder": "Select a country",
      "required": false,
      "options": [{ "label": "Option 1", "value": "option_1" }]
    }
  },
  {
    "id": "8146",
    "type": "SelectField",
    "extraAttributes": {
      "label": "Select Language",
      "helperText": "Helper text",
      "placeHolder": "Chose your language",
      "required": false,
      "options": [{ "label": "Option 1", "value": "option_1" }]
    }
  },
  {
    "id": "5162",
    "type": "TelephoneField",
    "extraAttributes": {
      "label": "Phone Number",
      "helperText": "",
      "placeHolder": "e.g.: +1 123 456 789 ",
      "required": false
    }
  },
  { "id": "9656", "type": "SeparatorField", "extraAttributes": {} },
  {
    "id": "6810",
    "type": "TitleField",
    "extraAttributes": { "title": "Other Contact" }
  },
  {
    "id": "3586",
    "type": "TextField",
    "extraAttributes": {
      "label": "Relationship with Patient",
      "helperText": "Helper text",
      "placeHolder": "e.g.: Legal Tutor, Spouse, Family",
      "required": false
    }
  },
  {
    "id": "6630",
    "type": "TextField",
    "extraAttributes": {
      "label": "Patient Name",
      "helperText": "",
      "placeHolder": "Patient's First Name",
      "required": false
    }
  },
  {
    "id": "8005",
    "type": "TextField",
    "extraAttributes": {
      "label": "Patient Last Name",
      "helperText": "",
      "placeHolder": "Patient's Last Name",
      "required": false
    }
  },
  {
    "id": "4168",
    "type": "TelephoneField",
    "extraAttributes": {
      "label": "Phone Number",
      "helperText": "Other contact's phone number.",
      "placeHolder": "+1 234 567 890",
      "required": false
    }
  }
]
```

"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppProvider";
import PreviewDialogBtn from "./PreviewDialogBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "@/components/builder/Designer";
import { Input } from "@/components/ui/input";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import DragOverlayWrapper from "@/components/builder/DragOverlayWrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from 'next-auth/react';
import { useFormState } from '@/hooks/forms/useFormState';
import { ElementsType, Form, FormElements } from "@/types";
import { idGenerator } from "@/lib/idGenerator";
import { ChevronLeftCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FormBuilderProps = {
    shareUrl: string,
}

function FormBuilder({ shareUrl }: FormBuilderProps) {
    const {
        selectors: { handleFormNameChange, setSelectedElement, setElements, setLoading, setError, setForm },
        data: { unsavedChanges, loading, form, elements }, // Include elements here
        actions: { formActions },
    } = useAppContext();

    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isPublished, setIsPublished] = useState<boolean>(true);
    const toast = useToast();
    const router = useRouter();
    const { data: session } = useSession();
    const { fetchFormByShareUrl } = useFormState();

    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!active || !over) return;

        const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
        const isDroppingOverDesignerDropArea = over.data?.current?.isDesignerDropArea;

        const droppingSidebarBtnOverDesignerDropArea =
            isDesignerBtnElement && isDroppingOverDesignerDropArea;

        if (droppingSidebarBtnOverDesignerDropArea) {
            const type = active.data?.current?.type;
            const newElement = FormElements[type as ElementsType].construct(idGenerator());

            formActions.addElement(elements.length, newElement); // Use elements here
            return;
        }

        const isDroppingOverDesignerElementTopHalf = over.data?.current?.isTopHalfDesignerElement;
        const isDroppingOverDesignerElementBottomHalf = over.data?.current?.isBottomHalfDesignerElement;
        const isDroppingOverDesignerElement =
            isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;

        const droppingSidebarBtnOverDesignerElement =
            isDesignerBtnElement && isDroppingOverDesignerElement;

        if (droppingSidebarBtnOverDesignerElement) {
            const type = active.data?.current?.type;
            const newElement = FormElements[type as ElementsType].construct(idGenerator());

            const overId = over.data?.current?.elementId;
            const overElementIndex = elements.findIndex((el) => el.id === overId); // Use elements here
            if (overElementIndex === -1) {
                console.error("Element not found for dropping:", overId);
                return;
            }

            let indexForNewElement = overElementIndex;
            if (isDroppingOverDesignerElementBottomHalf) {
                indexForNewElement = overElementIndex + 1;
            }

            formActions.addElement(indexForNewElement, newElement);
            return;
        }

        const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
        const draggingDesignerElementOverAnotherDesignerElement =
            isDroppingOverDesignerElement && isDraggingDesignerElement;

        if (draggingDesignerElementOverAnotherDesignerElement) {
            const activeId = active.data?.current?.elementId;
            const overId = over.data?.current?.elementId;

            const activeElementIndex = elements.findIndex((el) => el.id === activeId); // Use elements here
            const overElementIndex = elements.findIndex((el) => el.id === overId);

            if (activeElementIndex === -1 || overElementIndex === -1) {
                console.error("Element not found for reordering:", activeId, overId);
                return;
            }

            const activeElement = { ...elements[activeElementIndex] };
            formActions.removeElement(activeId);

            let indexForNewElement = overElementIndex;
            if (isDroppingOverDesignerElementBottomHalf) {
                indexForNewElement = overElementIndex + 1;
            }

            formActions.addElement(indexForNewElement, activeElement);
        }
    };


    useEffect(() => {
        const fetchFormData = async () => {
            if (session?.user.businessId) {
                try {
                    setLoading(true);
                    setError(null);

                    const formData = await fetchFormByShareUrl(shareUrl, session.user.businessId);
                    if (formData) {
                        console.log('formData', formData);
                        setForm(formData);
                        setElements(formData.fields!);
                    } else {
                        setError('Form not found');
                    }
                } catch (err: any) {
                    console.error('Error fetching form:', err);
                    setError(err.message || 'Failed to fetch form');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFormData();
    }, [shareUrl, session?.user.businessId, fetchFormByShareUrl, setForm, setElements, setError, setLoading]);


    useEffect(() => {
        if (form && form.published === false) {
            setIsPublished(false);
        } else {
            setIsPublished(true);
        }
    }, [form]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <ImSpinner2 className="animate-spin h-12 w-12" />
            </div>
        );
    }


    if (!form) {
        return <div>Form not found</div>;
    }

    const shareUrlLink = `${window.location.origin}/submit/${encodeURIComponent(form.name)}`;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <main className="flex flex-col w-full min-h-screen">
                <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                                        <ChevronLeftCircle />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Back Home</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <span className="text-muted-foreground mr">Form:</span>
                        {isEditingName ? (
                            <Input
                                value={form.name}
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
                                {form.name}
                            </h2>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <PreviewDialogBtn />
                        <SaveFormBtn unsavedChanges={unsavedChanges} loading={loading} />
                        <Button
                            variant={!isPublished ? "outline" : "default"}
                            className="gap-2"
                            onClick={() => {
                                !isPublished
                                    ? formActions.publishForm("publish")
                                    : formActions.publishForm("unpublish");
                            }}
                        >
                            {!isPublished ? 'Publish' : 'Unpublish'}
                        </Button>
                        {isPublished ? (
                            <Button onClick={() => router.push(shareUrlLink)}>View Form</Button>
                        ) : null}
                    </div>
                </nav>
                <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[210px] bg-transparent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
                    <Designer />
                </div>
            </main>
            <DragOverlayWrapper />
        </DndContext>
    );
}

export default FormBuilder;

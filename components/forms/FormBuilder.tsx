'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import PreviewDialogBtn from "./PreviewDialogBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "../Designer";
import { Input } from "../ui/input";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import DragOverlayWrapper from "../DragOverlayWrapper";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";

function FormBuilder() {
    const {
        selectors: { handleFormNameChange, setSelectedElement },
        data: { formName, unsavedChanges, form },
        actions: { saveForm, publishForm, addElement, removeElement, updateElement },
    } = useAppContext();

    const [isReady, setIsReady] = useState<boolean>(false);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isPublished, setIsPublished] = useState<boolean>(true); // Local state to track published status
    const toast = useToast();
    const router = useRouter();

    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } });
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleNavigationAlert = (e: BeforeUnloadEvent) => {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    };

    // Set isReady after a delay to simulate component readiness
    useEffect(() => {
        setSelectedElement(null);
        const readyTimeout = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(readyTimeout);
    }, [setSelectedElement]);

    // Add navigation alert for unsaved changes
    useEffect(() => {
        window.addEventListener('beforeunload', handleNavigationAlert);
        return () => {
            window.removeEventListener('beforeunload', handleNavigationAlert);
        };
    }, [unsavedChanges]);

    // Check if the form is published or not
    useEffect(() => {
        if (form && form.published === false) {
            setIsPublished(false);
        } else {
            setIsPublished(true);
        }
    }, [form]);

    const shareUrl = `${window.location.origin}/submit/${encodeURIComponent(formName)}`;


    // Function to handle the unpublish action
    const handleUnpublish = async () => {
        try {
            const res = await fetch("/api/forms/publish-unpublish-form", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ form_id: form?.id, action: "unpublish" }),
            });

            const data = await res.json();
            if (res.ok) {
                setIsPublished(false);
                toast.toast({
                    title: "Success",
                    description: "Form unpublished successfully.",
                    variant: "default",
                });
            } else {
                toast.toast({
                    title: "Error",
                    description: data.message || "Failed to unpublish form.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast.toast({
                title: "Error",
                description: "An error occurred while unpublishing the form.",
                variant: "destructive",
            });
        }
    };

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
                            {!isPublished && (
                                <span className="text-red-500 font-bold">Unpublished</span>
                            )}
                            <PreviewDialogBtn />
                            <SaveFormBtn />

                            <Button
                                variant={!isPublished ? "outline" : "default"}
                                className="gap-2"
                                onClick={() => {
                                    !isPublished ?
                                        publishForm("publish") :
                                        publishForm("unpublish")
                                }}
                            >
                                {!isPublished ? 'Publish' : 'Unpublish'}
                            </Button>
                            {isPublished ? (
                                <Button onClick={() => router.push(shareUrl)}>View Form</Button>
                            ) : null}
                        </div>
                    </nav>
                    <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
                        <Designer />
                    </div>
                </main>
            )}
            <DragOverlayWrapper />
        </DndContext>
    );
}

export default FormBuilder;

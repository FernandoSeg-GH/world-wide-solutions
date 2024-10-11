'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import PreviewDialogBtn from "./PreviewDialogBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "../builder/Designer";
import { Input } from "../ui/input";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import DragOverlayWrapper from "@/components/builder/DragOverlayWrapper";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";


function FormBuilder({ formName }: { formName: string }) {
    const {
        selectors: { handleFormNameChange, setSelectedElement },
        data: { unsavedChanges, form, loading },
        actions: { saveForm, publishForm, addElement, removeElement, updateElement },
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

    const shareUrl = `${window.location.origin}/submit/${encodeURIComponent(formName)}`;

    return (
        <DndContext
            sensors={sensors}
        >
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

'use client';

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/components/context/AppContext";
import PreviewDialogBtn from "./PreviewDialogBtn";
import PublishFormBtn from "./PublishFormBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "../Designer";
import { Input } from "../ui/input";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import DragOverlayWrapper from "../DragOverlayWrapper";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

function FormBuilder() {
    const {
        selectors: { handleFormNameChange, setSelectedElement },
        data: { formName, unsavedChanges },
        actions: { saveForm, publishForm, addElement, removeElement, updateElement },
    } = useAppContext();

    const [isReady, setIsReady] = useState<boolean>(false);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);

    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } });
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleNavigationAlert = (e: BeforeUnloadEvent) => {
        if (unsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    };

    useEffect(() => {
        if (isReady) return;
        setSelectedElement(null);
        const readyTimeout = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(readyTimeout);
    }, [isReady, setSelectedElement]);


    useEffect(() => {
        window.addEventListener('beforeunload', handleNavigationAlert);
        return () => {
            window.removeEventListener('beforeunload', handleNavigationAlert);
        };
    }, [unsavedChanges]);

    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <ImSpinner2 className="animate-spin h-12 w-12" />
            </div>
        );
    }
    const router = useRouter()
    const shareUrl = `${window.location.origin}/submit/${formName}`;

    return (
        <DndContext sensors={sensors}>
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
                        <PreviewDialogBtn />
                        <SaveFormBtn />
                        <PublishFormBtn />
                        <Button onClick={() => router.push(shareUrl)}>View Form</Button>
                    </div>
                </nav>
                <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
                    <Designer />
                </div>
            </main>
            <DragOverlayWrapper />
        </DndContext>
    );
}

export default FormBuilder;

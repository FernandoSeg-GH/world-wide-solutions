"use client";

import React, { useEffect, useState } from "react";
import { useFormContext } from "@/components/context/FormContext"; // Use the context
import PreviewDialogBtn from "./PreviewDialogBtn";
import PublishFormBtn from "./PublishFormBtn";
import SaveFormBtn from "./SaveFormBtn";
import Designer from "../Designer";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ImSpinner2 } from "react-icons/im";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Confetti from "react-confetti";
import DragOverlayWrapper from "../DragOverlayWrapper";
import useDesigner from "../hooks/useDesigner"; // Assuming this hook provides state management for form elements

function FormBuilder() {
    const { formName, setFormName, elements, unsavedChanges, saveForm, publishForm, handleFormNameChange } = useFormContext(); // Use the form context
    const { setElements, setSelectedElement } = useDesigner(); // Use designer state
    const [isReady, setIsReady] = useState<boolean>(false); // Track if ready
    const [isEditingName, setIsEditingName] = useState<boolean>(false); // To toggle edit mode
    const { toast } = useToast();

    const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } });
    const sensors = useSensors(mouseSensor, touchSensor);

    // Function to alert when navigating away with unsaved changes
    const handleNavigationAlert = () => {
        if (unsavedChanges) {
            const confirmExit = window.confirm(
                "You have unsaved changes. Do you want to save before leaving?\n\nOptions:\n- Cancel\n- Save and Close\n- Close without Saving"
            );
            if (confirmExit) {
                saveForm();
            }
        }
    };

    // Initialize form elements once ready
    useEffect(() => {
        if (isReady) return;
        setElements(elements); // Initialize elements from context
        setSelectedElement(null); // Reset selected element
        const readyTimeout = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(readyTimeout);
    }, [elements, setElements, isReady, setSelectedElement]);

    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <ImSpinner2 className="animate-spin h-12 w-12" />
            </div>
        );
    }

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
                                onBlur={() => setIsEditingName(false)} // Exit edit mode
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

'use client';

import React, { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession hook from next-auth
import { FormElementInstance } from "../forms/FormElements";
import { useFetchForms } from '../hooks/useFetchForms'; // Import the custom hook

type DesignerContextType = {
    elements: FormElementInstance[];
    setElements: Dispatch<SetStateAction<FormElementInstance[]>>;
    addElement: (index: number, element: FormElementInstance) => void;
    removeElement: (id: string) => void;
    selectedElement: FormElementInstance | null;
    setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>;
    updateElement: (id: string, element: FormElementInstance) => void;
};

export const DesignerContext = createContext<DesignerContextType | null>(null);

export default function DesignerContextProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession(); // Get session and status using useSession
    const [businessId, setBusinessId] = useState<number | undefined>(undefined); // State to store businessId
    const { forms, isLoading, error } = useFetchForms(businessId); // Pass businessId to the custom hook
    const [elements, setElements] = useState<FormElementInstance[]>([]);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

    // Effect to get businessId from the session
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.businessId) {
            setBusinessId(session.user.businessId); // Set the businessId from session
        }
    }, [session, status]);

    // Effect to set elements once forms are fetched
    useEffect(() => {
        if (forms.length > 0) {
            const formElements = forms[0].fields as FormElementInstance[]; // Assuming you use the first form for design
            setElements(formElements);
        }
    }, [forms]);

    const addElement = (index: number, element: FormElementInstance) => {
        console.log('element', element)
        setElements((prev) => {
            const newElements = [...prev];
            newElements.splice(index, 0, element);
            return newElements;
        });
    };

    const removeElement = (id: string) => {
        setElements((prev) => prev.filter((element) => element.id !== id));
    };

    const updateElement = (id: string, element: FormElementInstance) => {
        setElements((prev) => {
            const newElements = [...prev];
            const index = newElements.findIndex((el) => el.id === id);
            newElements[index] = element;
            return newElements;
        });
    };

    return (
        <DesignerContext.Provider
            value={{
                elements,
                setElements,
                addElement,
                removeElement,
                selectedElement,
                setSelectedElement,
                updateElement,
            }}
        >
            {children}
        </DesignerContext.Provider>
    );
}

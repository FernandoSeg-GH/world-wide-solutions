import React, { useTransition } from "react";
import { Button } from "../ui/button";
import { HiSaveAs } from "react-icons/hi";
import useDesigner from "../hooks/useDesigner";
import { toast } from "../ui/use-toast";
import { FaSpinner } from "react-icons/fa";

function SaveFormBtn({ id, shareUrl }: { id: number; shareUrl?: string }) {
    const { elements } = useDesigner(); // Custom hook to get form elements
    const [loading, startTransition] = useTransition();

    const updateFormContent = async () => {
        try {
            const jsonElements = JSON.stringify(elements);  // Convert elements to JSON

            // Call the Next.js API route directly
            const response = await fetch(`/api/forms/save-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    form_id: id,          // Pass the form ID to identify the form
                    fields: JSON.parse(jsonElements),  // Convert elements back to JSON
                    business_id: 1,       // Ensure a valid business_id is passed
                    share_url: shareUrl,  // Pass the shareURL if it exists
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error saving form");
            }

            toast({
                title: "Success",
                description: "Your form has been saved",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };


    return (
        <Button
            variant={"outline"}
            className="gap-2"
            disabled={loading}
            onClick={() => {
                startTransition(updateFormContent);
            }}
        >
            <HiSaveAs className="h-4 w-4" />
            Save
            {loading && <FaSpinner className="animate-spin" />}
        </Button>
    );
}

export default SaveFormBtn;

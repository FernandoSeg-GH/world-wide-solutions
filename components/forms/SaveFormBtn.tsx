import React from "react";
import { Button } from "../ui/button";
import { HiSaveAs } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { useFormContext } from "../context/FormContext"; // Use the form context for state and actions

function SaveFormBtn() {
    // Get necessary values from FormContext
    const { saveForm, unsavedChanges, loading } = useFormContext();

    const handleSave = async () => {
        try {
            await saveForm();
        } catch (error) {
            console.error("Error during saveForm:", error); // Add logging for debugging
        }
    };

    return (
        <Button
            variant={unsavedChanges ? "default" : "outline"} // Highlight the button if there are unsaved changes
            className={`gap-2 ${unsavedChanges ? "bg-yellow-500" : ""}`} // Apply style if unsavedChanges
            disabled={loading}
            onClick={handleSave} // Call saveForm from context when clicked
        >
            <HiSaveAs className="h-4 w-4" />
            {loading ? "Saving..." : "Save"}
            {loading && <FaSpinner className="animate-spin" />}
        </Button>
    );
}

export default SaveFormBtn;

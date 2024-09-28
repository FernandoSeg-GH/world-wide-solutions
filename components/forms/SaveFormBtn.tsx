'use client';

import React from "react";
import { Button } from "../ui/button";
import { HiSaveAs } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";

function SaveFormBtn() {
    const {
        data: { unsavedChanges },
        actions: { saveForm },
        data: { loading },
    } = useAppContext();

    const handleSave = async () => {
        try {
            await saveForm();
        } catch (error) {
            console.error("Error during saveForm:", error);
        }
    };

    return (
        <Button
            variant={unsavedChanges ? "default" : "outline"}
            className={`gap-2 ${unsavedChanges ? "bg-yellow-500" : ""}`}
            disabled={loading}
            onClick={handleSave}
        >
            <HiSaveAs className="h-4 w-4" />
            {loading ? "Saving..." : "Save"}
            {loading && <FaSpinner className="animate-spin" />}
        </Button>
    );
}

export default SaveFormBtn;

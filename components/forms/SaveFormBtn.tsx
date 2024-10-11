'use client';

import React from "react";
import { Button } from "../ui/button";
import { HiSaveAs } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { useAppContext } from "../../context/AppContext";
import { DiscIcon } from "@radix-ui/react-icons";

type SaveFormBtnType = {
    unsavedChanges: boolean
    loading: boolean
}

function SaveFormBtn({ unsavedChanges, loading }: SaveFormBtnType) {
    const {
        actions: { saveForm },
    } = useAppContext();

    const handleSave = async () => {
        try {
            await saveForm();
        } catch (error) {
            console.error("Error during saveForm:", error);
        }
    };
    if (unsavedChanges) {
        return (
            <Button
                variant={unsavedChanges ? "default" : "outline"}
                className={`gap-2 ${unsavedChanges ? "" : ""}`}
                disabled={loading}
                onClick={handleSave}
            >
                <DiscIcon className="h-4 w-4" />
                {loading ? "Saving..." : "Save"}
                {loading && <FaSpinner className="animate-spin" />}
            </Button>
        );
    } else {
        <Button
            variant={"outline"}
            disabled={loading}
        >
            <DiscIcon className="h-4 w-4" />qdwqdqw
            {loading ? "Saving..." : "Save"}
        </Button>

    }
}

export default SaveFormBtn;

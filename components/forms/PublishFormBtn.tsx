import React from "react";
import { Button } from "../ui/button";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "../ui/dropdown-menu";
import { FaSpinner } from "react-icons/fa";
import { useFormContext } from "@/components/context/FormContext"; // Use the form context

function PublishFormBtn() {
    const { publishForm, loading, formName } = useFormContext(); // Get necessary methods and state from context
    const isPublished = formName === "Published"; // You can adjust this logic based on how `formName` tracks state

    const handleTogglePublish = () => {
        const action = isPublished ? "unpublish" : "publish";
        publishForm(action); // Call `publishForm` from context
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={!isPublished ? "outline" : "default"} className="gap-2">
                    {isPublished ? <p>PUBLISHED</p> : <p>UNPUBLISHED</p>}
                    {loading && <FaSpinner className="animate-spin" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleTogglePublish}>
                    {isPublished ? "Unpublish" : "Publish"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default PublishFormBtn;

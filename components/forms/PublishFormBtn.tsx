import React, { useTransition, useState } from "react";
import { Button } from "../ui/button";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "../ui/use-toast";
import { FaSpinner } from "react-icons/fa";

function PublishFormBtn({ id, isPublished }: { id: number, isPublished: boolean }) {
    const [loading, startTransition] = useTransition();

    const togglePublishForm = async () => {
        try {
            const route = isPublished ? "/api/forms/unpublish-form" : "/api/forms/publish-form";

            const response = await fetch(route, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    form_id: id,  // Pass the form ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${isPublished ? "unpublishing" : "publishing"} form`);
            }

            const status = isPublished ? "Unpublished" : "Published";
            toast({
                title: `Success`,
                description: `Form has been ${status.toLowerCase()}.`,
            });
            window.location.reload();  // Refresh the page to reflect changes
        } catch (error) {
            toast({
                title: "Error",
                description: `Something went wrong`,
                variant: "destructive",
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    {isPublished ? "Published" : "Draft"}
                    {loading && <FaSpinner className="animate-spin" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={togglePublishForm}>
                    {isPublished ? "Unpublish" : "Publish"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default PublishFormBtn;

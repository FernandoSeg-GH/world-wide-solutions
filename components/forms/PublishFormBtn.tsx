'use client';

import React from "react";
import { Button } from "../ui/button";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "../ui/dropdown-menu";
import { FaSpinner } from "react-icons/fa";
import { useAppContext } from "@/components/context/AppContext";

function PublishFormBtn() {
    const { data: { formName, loading }, actions: { publishForm } } = useAppContext();
    const isPublished = formName === "Published";

    const handleTogglePublish = () => {
        const action = isPublished ? "unpublish" : "publish";
        publishForm(action);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={!isPublished ? "outline" : "default"} className="gap-2">
                    {isPublished ? <p>Published</p> : <p>Unpublished</p>}
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

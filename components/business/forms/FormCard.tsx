"use client"
import React, { useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiRightArrowAlt } from "react-icons/bi";
import { FaEdit, FaWpforms } from "react-icons/fa";
import { LuView } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Form } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppProvider";

interface FormCardProps {
    form: Form;
}

export function FormCard({ form }: FormCardProps) {
    const { data: session } = useSession();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [publishedStatus, setPublishedStatus] = useState(form.published);
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const router = useRouter();
    const { toast } = useToast();
    const {
        actions: { formActions },
        data: { loading: isPublishing },
    } = useAppContext();

    // useEffect(() => {
    //     setPublishedStatus(form.published);
    // }, [form.published]);


    const userRoleId = Number(session?.user.role.id);
    const isAdminRole = [2, 3, 4].includes(userRoleId);

    const handlePublishToggle = async () => {
        const action = publishedStatus ? "unpublish" : "publish";

        try {
            await formActions.publishForm(action);
            const updatedStatus = publishedStatus ? "Unpublished" : "Published";
            toast({
                title: `Form ${updatedStatus}`,
                description: `The form has been ${updatedStatus.toLowerCase()}.`,
            });
            setPublishedStatus(!publishedStatus);
        } catch (error) {
            console.error(`Error ${action}ing form:`, error);
            toast({
                title: "Error",
                description: `Failed to ${action} the form.`,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        if (deleteInputValue !== "DELETE_THE_FORM_AND_ALL_DATA") {
            toast({
                title: "Error",
                description:
                    "You must type the confirmation text exactly to proceed.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/forms/delete?formId=${form.id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete form");
            }

            toast({
                title: "Form Deleted",
                description:
                    "The form and all associated data have been successfully deleted.",
            });

            setIsDeleting(false);
            setIsAlertOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error deleting form:", error);
            toast({
                title: "Error",
                description: "Failed to delete the form.",
                variant: "destructive",
            });
            setIsDeleting(false);
        }
    };

    const handleNavigate = () => {

        router.push(`/forms/${form.shareURL}`);
    };


    const formattedDistance = form.createdAt
        ? formatDistance(new Date(form.createdAt), new Date(), {
            addSuffix: true,
        })
        : "Unknown time";

    return (
        <Card
            className={cn(
                "lg:max-w-[450px] w-full",
                isAdminRole ? "h-auto" : "h-[210px]"
            )}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center justify-between gap-2 w-full">
                        <span className="truncate text-ellipsis font-bold">{form.name}</span>

                        {isAdminRole && (
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={publishedStatus ? "default" : "outline"}
                                    className={publishedStatus ? "bg-blue-500" : ""}
                                >
                                    {publishedStatus ? "Published" : "Unpublished"}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onSelect={handlePublishToggle}
                                            disabled={isPublishing}
                                        >
                                            {isPublishing
                                                ? "Processing..."
                                                : publishedStatus
                                                    ? "Unpublish Form"
                                                    : "Publish Form"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => setIsAlertOpen(true)}
                                            disabled={publishedStatus}
                                        >
                                            {publishedStatus ? "Unpublish to Delete" : "Delete Form"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </CardTitle>
                <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
                    <div>
                        {isAdminRole && (
                            <div>
                                <span>{formattedDistance}</span>
                                {publishedStatus && (
                                    <div className="flex items-center gap-2 mt-1">
                                        {form.visits !== undefined && (
                                            <div className="flex items-center gap-1">
                                                <LuView className="text-muted-foreground" />
                                                <span>{form.visits.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {form.FormSubmissions && form.FormSubmissions.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <FaWpforms className="text-muted-foreground" />
                                                <span>{form.FormSubmissions.length + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
                {form.description || ""}
            </CardContent>
            <CardFooter>
                {isAdminRole ? (
                    <div className="flex flex-col w-full">
                        {publishedStatus ? (
                            <Button
                                className="w-full mt-2 text-md gap-4"
                                onClick={handleNavigate}
                            >
                                View submissions <BiRightArrowAlt />
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full mt-2 text-md gap-4"
                                onClick={() => router.push(`/builder/${form.shareURL}`)}
                            >
                                Edit form <FaEdit />
                            </Button>
                        )}
                    </div>
                ) : (
                    <div>
                        <span>You have already submitted this form.</span>
                    </div>
                )}
            </CardFooter>
            {/* Alert Dialog for Deletion Confirmation */}
            {isAdminRole && (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Form</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this form? This action will remove the form and all associated submissions permanently and cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogDescription>
                            <span>
                                Please type "<span className="font-bold">DELETE_THE_FORM_AND_ALL_DATA</span>" below to confirm.
                            </span>
                        </AlertDialogDescription>
                        <input
                            className="mt-2 w-full border p-2"
                            type="text"
                            placeholder="DELETE_THE_FORM_AND_ALL_DATA"
                            value={deleteInputValue}
                            onChange={(e) => setDeleteInputValue(e.target.value)}
                            aria-label="Delete confirmation input"
                        />
                        <AlertDialogFooter>
                            <Button
                                variant="secondary"
                                onClick={() => setIsAlertOpen(false)}
                                className="mr-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={
                                    isDeleting || deleteInputValue !== "DELETE_THE_FORM_AND_ALL_DATA"
                                }
                            >
                                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Card>
    );
}

export default FormCard;

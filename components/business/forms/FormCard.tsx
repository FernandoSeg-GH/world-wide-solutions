import React, { useState } from "react";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiPlus, BiPlusCircle, BiRightArrowAlt } from "react-icons/bi";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
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
import { FaEdit, FaWpforms } from "react-icons/fa";
import { LuView } from "react-icons/lu";
import Spinner from "@/components/ui/spinner";

interface FormCardProps {
    form: Form;
}

export function FormCard({ form }: FormCardProps) {
    const { data: session } = useSession();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const [isRouting, setIsRouting] = useState<boolean>(false)
    const { actions, selectors } = useAppContext();
    const { switchSection } = actions;
    const { setForm } = selectors;

    const router = useRouter();
    const { toast } = useToast();
    const {
        actions: { formActions },
        data: { loading: isPublishing },
    } = useAppContext();

    const userRoleId = Number(session?.user.role.id);
    const isAdminRole = [2, 3, 4].includes(userRoleId);
    const isRole1User = userRoleId === 1;

    const handlePublishToggle = async () => {
        const action = form.published ? "unpublish" : "publish";

        try {
            await formActions.publishForm(action);

            // Update the form in context immutably
            setForm({ ...form, published: !form.published });

            toast({
                title: `Form ${!form.published ? "Published" : "Unpublished"}`,
                description: `The form has been ${!form.published ? "published" : "unpublished"}.`,
            });
        } catch (error: any) {
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
                description: "You must type the confirmation text exactly to proceed.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/forms/${session?.user.businessId}/share-url/delete?formId=${form.id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete form");
            }

            setIsDeleting(false);
            setIsAlertOpen(false);
            window.location.reload();
        } catch (error: any) {
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
        setForm(form);
        switchSection("Form");
    };

    const handleNew = () => {
        setIsRouting(true)
        router.push(`/submit/${form.shareUrl}`);

        // else {
        //     toast({
        //         title: "Error",
        //         description: "Form share URL is missing.",
        //         variant: "destructive",
        //     });
        // }
    };

    const formattedDate = form.createdAt
        ? formatDistance(new Date(form.createdAt), new Date(), { addSuffix: true })
        : "Unknown";

    if (!form) return <div className="flex items-center justify-center w-screen h-screen">
        <Spinner />
    </div>;

    return (
        <Card
            className={cn(
                "w-full bg-muted/10 dark:text-gray-100 min-w-[300px]",
                isAdminRole ? "h-auto" : "h-[210px]"
            )}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex flex-col items-start justify-start gap-2 w-full">
                        {isAdminRole && (
                            <div className="flex items-center justify-between w-full gap-2">
                                <Badge
                                    variant={form.published ? "default" : "outline"}
                                    className={form.published ? "" : "text-black dark:text-gray-200 dark:border-gray-400"}
                                >
                                    <span>{form.published ? "Published" : "Unpublished"}</span>
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
                                            onSelect={() => window.open(`/submit/${form.shareUrl}`, '_blank')}
                                        >
                                            View Form
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={handlePublishToggle}
                                            disabled={isPublishing}
                                        >
                                            {isPublishing
                                                ? "Processing..."
                                                : form.published
                                                    ? "Unpublish Form"
                                                    : "Publish Form"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => setIsAlertOpen(true)}
                                            disabled={form.published}
                                        >
                                            {form.published ? "Unpublish to Delete" : "Delete Form"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        <h2 className="truncate leading-6 text-ellipsis font-bold">{form.name}</h2>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="truncate text-sm text-muted-foreground dark:text-primary-foreground flex flex-col justify-between h-auto">
                <div className="flex items-center justify-between text-muted-foreground dark:text-primary-foreground text-sm ">
                    <span>{formattedDate}</span>
                    {form.published && (
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
                <p className="min-h-[20px] text-wrap line-clamp-2">{form.description}</p>
            </CardContent>
            <CardFooter>
                {isAdminRole ? (
                    <div className="flex flex-col w-full">
                        {form.published ? (
                            <Button
                                className={`w-full mt-2 text-md gap-4 `}
                                onClick={handleNavigate}
                            >
                                Manage <BiRightArrowAlt />
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full mt-2 text-md gap-4 bg-transparent border text-black hover:bg-primary hover:text-white dark:text-gray-100"
                                onClick={() => router.push(`/builder/${form.shareUrl}`)}
                            >
                                Edit form <FaEdit />
                            </Button>
                        )}
                    </div>
                ) : form.shareUrl !== undefined && session?.user.role.id === 1 ? (
                    <Button
                        disabled={isRouting}
                        className={`w-full mt-2 text-md gap-4 `}
                        onClick={handleNew}
                    >
                        New Submission <BiPlus />
                    </Button>
                ) : null}
            </CardFooter>
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
                                Please type &quot;
                                <span className="font-bold">
                                    DELETE_THE_FORM_AND_ALL_DATA
                                </span>
                                &quot; below to confirm.
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
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Card>
    );
}

export default FormCard;

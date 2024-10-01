"use client"
import React, { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { Button } from '../ui/button';
import { BiRightArrowAlt } from 'react-icons/bi';
import { FaEdit, FaWpforms } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Form } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from '../ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { useAppContext } from '../context/AppContext';

function FormCard({ form }: { form: Form }) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [publishedStatus, setPublishedStatus] = useState(form.published);
    const [deleteInputValue, setDeleteInputValue] = useState("");
    const router = useRouter();
    const { toast } = useToast();
    const { actions: { publishForm }, data: { loading: isPublishing } } = useAppContext();

    useEffect(() => {
        setPublishedStatus(form.published);
    }, [form.published]);

    const handlePublishToggle = async () => {
        const action = publishedStatus ? "unpublish" : "publish";

        try {
            await publishForm(action);
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
                description: "You must type the confirmation text exactly to proceed.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/forms/delete?formId=${form.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete form');
            }

            toast({
                title: "Form Deleted",
                description: "The form and all associated data have been successfully deleted.",
            });

            setIsDeleting(false);
            setIsAlertOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting form:', error);
            toast({
                title: "Error",
                description: "Failed to delete the form.",
                variant: "destructive",
            });
            setIsDeleting(false);
        }
    };

    const formattedDistance = form.createdAt
        ? formatDistance(new Date(form.createdAt), new Date(), { addSuffix: true })
        : 'Unknown time';
    console.log('form card', form)
    return (
        <Card className='lg:max-w-[450px] h-[200px] w-full'>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center justify-between gap-2 w-full">
                        <div>
                            <span className="truncate text-ellipsis font-bold">{form.name}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            {publishedStatus ? <Badge variant="default" className='bg-blue-500'>Published</Badge> : <Badge variant="outline">Unpublished</Badge>}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={handlePublishToggle} disabled={isPublishing}>
                                        {isPublishing ? "Processing..." : publishedStatus ? "Unpublish Form" : "Publish Form"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setIsAlertOpen(true)} disabled={publishedStatus}>
                                        {publishedStatus ? "Unpublish to Delete" : "Delete Form"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardTitle>
                <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
                    <span>{formattedDistance}</span>
                    {publishedStatus && (
                        <span className="flex items-center gap-2">
                            {form.visits && (
                                <>
                                    <LuView className="text-muted-foreground" />
                                    <span>{form.visits.toLocaleString()}</span>
                                </>
                            )}
                            {form.FormSubmissions && form.FormSubmissions.length > 0 && (
                                <>
                                    <FaWpforms className="text-muted-foreground" />
                                    <span>{form.FormSubmissions.length}</span>
                                </>
                            )}
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
                {form.description || 'No description'}
            </CardContent>
            <CardFooter>
                <div className='flex flex-col w-full'>
                    {publishedStatus ? (
                        <Button className="w-full mt-2 text-md gap-4" onClick={() => router.push(`/forms/${form.shareURL}`)}>
                            View submissions <BiRightArrowAlt />
                        </Button>
                    ) : (
                        <Button asChild variant="secondary" className="w-full mt-2 text-md gap-4">
                            <Button onClick={() => router.push(`/builder/${form.shareURL}`)}>
                                Edit form <FaEdit />
                            </Button>
                        </Button>
                    )}
                </div>
            </CardFooter>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this form? This action will remove the form and all associated submissions permanently and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Please type "<span className='font-bold'>DELETE_THE_FORM_AND_ALL_DATA</span>" below to confirm.
                    </AlertDialogDescription>
                    <input
                        className="mt-2 w-full border p-2"
                        type="text"
                        placeholder="DELETE_THE_FORM_AND_ALL_DATA"
                        value={deleteInputValue}
                        onChange={(e) => setDeleteInputValue(e.target.value)}
                    />
                    <AlertDialogFooter>
                        <Button variant="secondary" onClick={() => setIsAlertOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || deleteInputValue !== "DELETE_THE_FORM_AND_ALL_DATA"}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default FormCard;

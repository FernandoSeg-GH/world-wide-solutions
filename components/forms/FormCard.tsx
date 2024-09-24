'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';

import { Button } from '../ui/button';
import { BiRightArrowAlt } from 'react-icons/bi';
import { FaEdit, FaWpforms } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Badge } from '../ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Form } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '../ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
} from '../ui/alert-dialog';
import { DeleteForm, PublishForm } from '@/actions/form';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';

function FormCard({ form }: { form: Form }) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const router = useRouter()

    const { toast } = useToast();

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            if (form.published) {
                toast({
                    title: "Alert! You may not delete a form if its status is PUBLISHED.",
                    variant: "destructive",
                });
                return;
            }
            const response = await DeleteForm(form.id);
            if (response) {
                router.refresh();
            } else {
                console.error("Failed to delete the form.");
            }
        } catch (error) {
            console.error('Error deleting form:', error);
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
        }
    };

    const handlePublishToggle = async () => {
        setIsPublishing(true);
        try {
            const updatedStatus = form.published ? "Unpublished" : "Published";
            await PublishForm(form.id);
            toast({
                title: `Form ${updatedStatus}`,
                description: `The form has been ${updatedStatus.toLowerCase()}.`,
            });
            router.refresh();
        } catch (error) {
            console.error(`Error ${form.published ? 'unpublishing' : 'publishing'} form:`, error);
            toast({
                title: "Error",
                description: `Failed to ${form.published ? 'unpublish' : 'publish'} the form.`,
                variant: "destructive",
            });
        } finally {
            setIsPublishing(false);
        }
    };


    let formattedDistance = 'Unknown time';
    if (form.createdAt) {
        const date = new Date(form.createdAt);
        if (!isNaN(date.getTime())) {
            formattedDistance = formatDistance(date, new Date(), {
                addSuffix: true,
            });
        } else {
            console.error(`Invalid createdAt date for form ID ${form.id}: ${form.createdAt}`);
        }
    } else {
        console.error(`Missing createdAt for form ID ${form.id}`);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center justify-between gap-2 w-full">
                        <div>
                            <span className="truncate font-bold mr-2">{form.id}.</span>
                            <span className="truncate font-bold">{form.name}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            {form.published ? <Badge variant="default" className='bg-blue-500'>Published</Badge> : <Badge variant="destructive">Draft</Badge>}
                            {/* Settings Dropdown */}
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
                                    {/* Publish/Unpublish */}
                                    <DropdownMenuItem onSelect={handlePublishToggle} disabled={isPublishing}>
                                        {isPublishing ? "Processing..." : form.published ? "Unpublish Form" : "Publish Form"}
                                    </DropdownMenuItem>
                                    {/* Delete Form */}
                                    <DropdownMenuItem onSelect={() => setIsAlertOpen(true)}>
                                        Delete Form
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardTitle>
                <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
                    <span className='capitalize'>{formattedDistance}</span>
                    {form.published && (
                        <span className="flex items-center gap-2">
                            <LuView className="text-muted-foreground" />
                            <span>{form.visits.toLocaleString()}</span>
                            <FaWpforms className="text-muted-foreground" />
                            <span>{form.submissions.toLocaleString()}</span>
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
                {form.description || 'No description'}
            </CardContent>
            <CardFooter>
                {form.published ? (
                    <div className='flex flex-col w-full'>
                        <Button asChild variant="secondary" className="w-full mt-2 text-md gap-4">
                            <Link href={`/builder/${form.id}`}>
                                Edit form <FaEdit />
                            </Link>
                        </Button>
                        <Button asChild className="w-full mt-2 text-md gap-4">
                            <Link href={`/forms/${form.id}`}>
                                View submissions <BiRightArrowAlt />
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-col w-full items-end h-full'>
                        <Button asChild variant="secondary" className="w-full mt-2 text-md gap-4">
                            <Link href={`/builder/${form.id}`}>
                                Edit form <FaEdit />
                            </Link>
                        </Button>
                        <Button className="w-full mt-2 text-md gap-4 border" variant="ghost">
                            Unpublished
                        </Button>
                    </div>
                )}
            </CardFooter>

            {/* Alert Dialog */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Form</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this form? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="secondary" onClick={() => setIsAlertOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default FormCard;

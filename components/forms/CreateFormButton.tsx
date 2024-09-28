"use client";

import { formSchema, formSchemaType } from "@/schemas/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImSpinner2 } from "react-icons/im";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/use-toast";
import { CreateForm } from "@/actions/form";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

function CreateFormBtn() {
    const { data: session } = useSession();
    const [businessId, setBusinessId] = useState<number | undefined>(undefined);  // Initialize with undefined
    const router = useRouter();

    // Move the session check logic into a useEffect to avoid state updates in render
    useEffect(() => {
        if (session?.user?.businessId) {
            setBusinessId(session.user.businessId);
        } else {
            console.log("User does not belong to a business");
        }
    }, [session]);  // Only run when session changes

    const form = useForm<formSchemaType>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: formSchemaType) {
        try {
            const session = await getSession();  // Retrieve session
            if (!session || !session.accessToken) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/forms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({
                    name: values.name,
                    description: String(values.description),
                    business_id: businessId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create form');
            }

            const result = await response.json();
            const formId = result?.form_id;
            const shareURL = result?.share_url;

            if (formId && shareURL) {
                toast({
                    title: 'Success',
                    description: 'Form created successfully',
                });

                setTimeout(() => {
                    router.push(`/builder/${shareURL}`);
                }, 500);  // Delay of 500ms to redirect
            } else {
                throw new Error('Form creation failed, no form ID or share URL returned.');
            }

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong, please try again later',
                variant: 'destructive',
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className="group border border-primary/20 h-[200px] w-full  items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4"
                >
                    <BsFileEarmarkPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    <p className="font-bold text-xl text-muted-foreground group-hover:text-primary">Create new form</p>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create form</DialogTitle>
                    <DialogDescription>Create a new form to start collecting responses</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting} className="w-full mt-4">
                        {!form.formState.isSubmitting && <span>Save</span>}
                        {form.formState.isSubmitting && <ImSpinner2 className="animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default CreateFormBtn;

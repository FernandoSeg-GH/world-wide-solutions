check out all these pages and components for my nextjs app. learn the logics, structures, and styling:
"use client";

import { formSchema, formSchemaType } from "@/schemas/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImSpinner2 } from "react-icons/im";
import { Button } from "./ui/button";
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";
import { CreateForm } from "@/actions/form";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { useRouter } from "next/navigation";

function CreateFormBtn() {
const router = useRouter();
const form = useForm<formSchemaType>({
resolver: zodResolver(formSchema),
});

    async function onSubmit(values: formSchemaType) {
        try {
            const formId = await CreateForm(values);
            toast({
                title: "Success",
                description: "Form created successfully",
            });
            router.push(`/builder/${formId}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong, please try again later",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className="group border border-primary/20 h-[190px] w-full  items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4"
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

## export default CreateFormBtn;

"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { SubmitForm } from "@/actions/form";

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
const formValues = useRef<{ [key: string]: string }>({});
const formErrors = useRef<{ [key: string]: boolean }>({});
const [renderKey, setRenderKey] = useState(new Date().getTime());

    const [submitted, setSubmitted] = useState(false);
    const [pending, startTransition] = useTransition();

    const validateForm: () => boolean = useCallback(() => {
        for (const field of content) {
            const actualValue = formValues.current[field.id] || "";
            const valid = FormElements[field.type].validate(field, actualValue);

            if (!valid) {
                formErrors.current[field.id] = true;
            }
        }

        if (Object.keys(formErrors.current).length > 0) {
            return false;
        }

        return true;
    }, [content]);

    const submitValue = useCallback((key: string, value: string) => {
        formValues.current[key] = value;
    }, []);

    const submitForm = async () => {
        formErrors.current = {};
        const validForm = validateForm();
        if (!validForm) {
            setRenderKey(new Date().getTime());
            toast({
                title: "Error",
                description: "please check the form for errors",
                variant: "destructive",
            });
            return;
        }

        try {
            const jsonContent = JSON.stringify(formValues.current);
            await SubmitForm(formUrl, jsonContent);
            setSubmitted(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    if (submitted) {
        return (
            <div className="flex justify-center w-full h-full items-center p-8">
                <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded">
                    <h1 className="text-2xl font-bold">Form submitted</h1>
                    <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full h-full items-center p-8">
            <div
                key={renderKey}
                className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded"
            >
                <div className="flex flex-col gap-8">
                    {content.map((element) => {
                        const FormElement = FormElements[element.type].formComponent;
                        return (
                            <FormElement
                                key={element.id}
                                elementInstance={element}
                                submitValue={submitValue}
                                isInvalid={formErrors.current[element.id]}
                                defaultValue={formValues.current[element.id]}
                            />
                        );
                    })}
                </div>
                <Button
                    className="mt-8"
                    onClick={() => {
                        startTransition(submitForm);
                    }}
                    disabled={pending}
                >
                    {!pending && (
                        <>
                            <HiCursorClick className="mr-2" />
                            Submit
                        </>
                    )}
                    {pending && <ImSpinner2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );

}

## export default FormSubmitComponent;

import { GetFormContentByUrl } from "@/actions/form";
import { FormElementInstance } from "@/components/FormElements";
import FormSubmitComponent from "@/components/FormSubmitComponent";
import React from "react";

async function SubmitPage({
params,
}: {
params: {
formUrl: string;
};
}) {
const form = await GetFormContentByUrl(params.formUrl);

    if (!form) {
        throw new Error("form not found");
    }

    const formContent = JSON.parse(form.content) as FormElementInstance[];

    return <FormSubmitComponent formUrl={params.formUrl} content={formContent} />;

}

## export default SubmitPage;

import { GetFormById, GetFormWithSubmissions } from "@/actions/form";
import FormLinkShare from "@/components/FormLinkShare";
import VisitBtn from "@/components/VisitBtn";
import React, { ReactNode } from "react";
import { StatsCard } from "../../page";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { ElementsType, FormElementInstance } from "@/components/FormElements";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

async function FormDetailPage({
params,
}: {
params: {
id: string;
};
}) {
const { id } = params;
const form = await GetFormById(Number(id));
if (!form) {
throw new Error("form not found");
}

    const { visits, submissions } = form;

    let submissionRate = 0;

    if (visits > 0) {
        submissionRate = (submissions / visits) * 100;
    }

    const bounceRate = 100 - submissionRate;

    return (
        <>
            <div className="py-10 border-b border-muted">
                <div className="flex justify-between container">
                    <h1 className="text-4xl font-bold truncate">{form.name}</h1>
                    <VisitBtn shareUrl={form.shareURL} />
                </div>
            </div>
            <div className="py-4 border-b border-muted">
                <div className="container flex gap-2 items-center justify-between">
                    <FormLinkShare shareUrl={form.shareURL} />
                </div>
            </div>
            <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 container">
                <StatsCard
                    title="Total visits"
                    icon={<LuView className="text-blue-600" />}
                    helperText="All time form visits"
                    value={visits.toLocaleString() || ""}
                    loading={false}
                    className="shadow-md shadow-gray-200"
                />

                <StatsCard
                    title="Total submissions"
                    icon={<FaWpforms className="text-yellow-600" />}
                    helperText="All time form submissions"
                    value={submissions.toLocaleString() || ""}
                    loading={false}
                    className="shadow-md shadow-gray-200"
                />

                <StatsCard
                    title="Submission rate"
                    icon={<HiCursorClick className="text-green-600" />}
                    helperText="Visits that result in form submission"
                    value={submissionRate.toLocaleString() + "%" || ""}
                    loading={false}
                    className="shadow-md shadow-gray-200"
                />

                <StatsCard
                    title="Bounce rate"
                    icon={<TbArrowBounce className="text-red-600" />}
                    helperText="Visits that leaves without interacting"
                    value={bounceRate.toLocaleString() + "%" || ""}
                    loading={false}
                    className="shadow-md shadow-gray-200"
                />
            </div>

            <div className="container pt-10">
                <SubmissionsTable id={form.id} />
            </div>
        </>
    );

}

export default FormDetailPage;

type Row = { [key: string]: string } & {
submittedAt: Date;
};

async function SubmissionsTable({ id }: { id: number }) {
const form = await GetFormWithSubmissions(id);

    if (!form) {
        throw new Error("form not found");
    }

    const formElements = JSON.parse(form.content) as FormElementInstance[];
    const columns: {
        id: string;
        label: string;
        required: boolean;
        type: ElementsType;
    }[] = [];

    formElements.forEach((element) => {
        switch (element.type) {
            case "TextField":
            case "NumberField":
            case "TextAreaField":
            case "DateField":
            case "SelectField":
            case "CheckboxField":
                columns.push({
                    id: element.id,
                    label: element.extraAttributes?.label,
                    required: element.extraAttributes?.required,
                    type: element.type,
                });
                break;
            default:
                break;
        }
    });

    const rows: Row[] = [];
    form.FormSubmissions.forEach((submission) => {
        const content = JSON.parse(submission.content);
        rows.push({
            ...content,
            submittedAt: submission.createdAt,
        });
    });

    return (
        <>
            <h1 className="text-2xl font-bold my-4">Submissions</h1>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.id} className="uppercase">
                                    {column.label}
                                </TableHead>
                            ))}
                            <TableHead className="text-muted-foreground text-right uppercase">Submitted at</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {columns.map((column) => (
                                    <RowCell key={column.id} type={column.type} value={row[column.id]} />
                                ))}
                                <TableCell className="text-muted-foreground text-right">
                                    {formatDistance(row.submittedAt, new Date(), {
                                        addSuffix: true,
                                    })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );

}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
let node: ReactNode = value;

    switch (type) {
        case "DateField":
            if (!value) break;
            const date = new Date(value);
            node = <Badge variant={"outline"}>{format(date, "dd/MM/yyyy")}</Badge>;
            break;
        case "CheckboxField":
            const checked = value === "true";
            node = <Checkbox checked={checked} disabled />;
            break;
    }

    return <TableCell>{node}</TableCell>;

## }

import { PublishForm } from "@/actions/form";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FaSpinner } from "react-icons/fa";
import { MdOutlinePublish } from "react-icons/md";
import {
AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";

function PublishFormBtn({ id }: { id: number }) {
const [loading, startTransition] = useTransition();
const router = useRouter();

    async function publishForm() {
        try {
            await PublishForm(id);
            toast({
                title: "Success",
                description: "Your form is now available to the public",
            });
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
            });
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="gap-2 text-white bg-gradient-to-r from-black to-gray-600">
                    <MdOutlinePublish className="h-4 w-4" />
                    Publish
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. After publishing you will not be able to edit this form. <br />
                        <br />
                        <span className="font-medium">
                            By publishing this form you will make it available to the public and you will be able to collect
                            submissions.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            startTransition(publishForm);
                        }}
                    >
                        Proceed {loading && <FaSpinner className="animate-spin" />}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

}

export default PublishFormBtn;

---

import { GetFormStats, GetForms } from "@/actions/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode, Suspense } from "react";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { Separator } from "@/components/ui/separator";
import CreateFormBtn from "@/components/CreateFormButton";
import { Form } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";

export default function Home() {
return (
<div className="container pt-4">
<Suspense fallback={<StatsCards loading={true} />}>
<CardStatsWrapper />
</Suspense>
<Separator className="my-6" />
<h2 className="text-4xl font-bold col-span-2">Your forms</h2>
<Separator className="my-6" />
<div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-2 md:gap-3 lg:gap-4">
{/_ Box for CreateFormBtn _/}
<div className="w-full">
<CreateFormBtn />
</div>

        {/* FormCards skeleton and content */}
        <div className="w-full">
          <Suspense
            fallback={[1, 2, 3, 4].map((el) => (
              <FormCardSkeleton key={el} />
            ))}
          >
            <FormCards />
          </Suspense>
        </div>
      </div>
    </div>

);
}

async function CardStatsWrapper() {
const stats = await GetFormStats();
return <StatsCards loading={false} data={stats} />;
}

interface StatsCardProps {
data?: Awaited<ReturnType<typeof GetFormStats>>;
loading: boolean;
}

function StatsCards(props: StatsCardProps) {
const { data, loading } = props;

return (
<div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
<StatsCard
title="Total visits"
icon={<LuView className="text-blue-600" />}
helperText="All time form visits"
value={data?.visits.toLocaleString() || ""}
loading={loading}
className="shadow-md shadow-gray-200"
// className="shadow-md shadow-blue-600"
/>

      <StatsCard
        title="Total submissions"
        icon={<FaWpforms className="text-yellow-600" />}
        helperText="All time form submissions"
        value={data?.submissions.toLocaleString() || ""}
        loading={loading}
        className="shadow-md shadow-gray-200"
      // className="shadow-md shadow-yellow-600"
      />

      <StatsCard
        title="Submission rate"
        icon={<HiCursorClick className="text-green-600" />}
        helperText="Visits that result in form submission"
        value={data?.submissionRate.toLocaleString() + "%" || ""}
        loading={loading}
        className="shadow-md shadow-gray-200"
      // className="shadow-md shadow-green-600"
      />

      <StatsCard
        title="Bounce rate"
        icon={<TbArrowBounce className="text-red-600" />}
        helperText="Visits that leaves without interacting"
        value={data?.submissionRate.toLocaleString() + "%" || ""}
        loading={loading}
        className="shadow-md shadow-gray-200"
      // className="shadow-md shadow-red-600"
      />
    </div>

);
}

export function StatsCard({
title,
value,
icon,
helperText,
loading,
className,
}: {
title: string;
value: string;
helperText: string;
className: string;
loading: boolean;
icon: ReactNode;
}) {
return (
<Card className={className}>
<CardHeader className="flex flex-row items-center justify-between pb-2">
<CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
{icon}
</CardHeader>
<CardContent>
<div className="text-2xl font-bold">
{loading && (
<Skeleton>
<span className="opacity-0">0</span>
</Skeleton>
)}
{!loading && value}
</div>
<p className="text-xs text-muted-foreground pt-1">{helperText}</p>
</CardContent>
</Card>
);
}

function FormCardSkeleton() {
return <Skeleton className="border-2 border-primary-/20 h-[190px] w-full" />;
}

async function FormCards() {
const forms = await GetForms();
return (
<>
{forms.map((form) => (
<FormCard key={form.id} form={form} />
))}
</>
);
}

function FormCard({ form }: { form: Form }) {
return (
<Card className="">
<CardHeader>
<CardTitle className="flex items-center gap-2 justify-between">
<span className="truncate font-bold">{form.name}</span>
{form.published && <Badge>Published</Badge>}
{!form.published && <Badge variant={"destructive"}>Draft</Badge>}
</CardTitle>
<CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
{formatDistance(form.createdAt, new Date(), {
addSuffix: true,
})}
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
{form.description || "No description"}
</CardContent>
<CardFooter>
{form.published && (
<Button asChild className="w-full mt-2 text-md gap-4">
<Link href={`/forms/${form.id}`}>
View submissions <BiRightArrowAlt />
</Link>
</Button>
)}
{!form.published && (
<Button asChild variant={"secondary"} className="w-full mt-2 text-md gap-4">
<Link href={`/builder/${form.id}`}>
Edit form <FaEdit />
</Link>
</Button>
)}
</CardFooter>
</Card>
);
}

---

import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
return <div className="flex w-full flex-col flex-grow mx-auto">{children}</div>;
}

export default layout;

---

"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { SubmitForm } from "@/actions/form";

function FormSubmitComponent({ formUrl, content }: { content: FormElementInstance[]; formUrl: string }) {
const formValues = useRef<{ [key: string]: string }>({});
const formErrors = useRef<{ [key: string]: boolean }>({});
const [renderKey, setRenderKey] = useState(new Date().getTime());

    const [submitted, setSubmitted] = useState(false);
    const [pending, startTransition] = useTransition();

    const validateForm: () => boolean = useCallback(() => {
        for (const field of content) {
            const actualValue = formValues.current[field.id] || "";
            const valid = FormElements[field.type].validate(field, actualValue);

            if (!valid) {
                formErrors.current[field.id] = true;
            }
        }

        if (Object.keys(formErrors.current).length > 0) {
            return false;
        }

        return true;
    }, [content]);

    const submitValue = useCallback((key: string, value: string) => {
        formValues.current[key] = value;
    }, []);

    const submitForm = async () => {
        formErrors.current = {};
        const validForm = validateForm();
        if (!validForm) {
            setRenderKey(new Date().getTime());
            toast({
                title: "Error",
                description: "please check the form for errors",
                variant: "destructive",
            });
            return;
        }

        try {
            const jsonContent = JSON.stringify(formValues.current);
            await SubmitForm(formUrl, jsonContent);
            setSubmitted(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    if (submitted) {
        return (
            <div className="flex justify-center w-full h-full items-center p-8">
                <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded">
                    <h1 className="text-2xl font-bold">Form submitted</h1>
                    <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full h-full items-center p-8">
            <div
                key={renderKey}
                className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-gray-200 rounded"
            >
                <div className="flex flex-col gap-8">
                    {content.map((element) => {
                        const FormElement = FormElements[element.type].formComponent;
                        return (
                            <FormElement
                                key={element.id}
                                elementInstance={element}
                                submitValue={submitValue}
                                isInvalid={formErrors.current[element.id]}
                                defaultValue={formValues.current[element.id]}
                            />
                        );
                    })}
                </div>
                <Button
                    className="mt-8"
                    onClick={() => {
                        startTransition(submitForm);
                    }}
                    disabled={pending}
                >
                    {!pending && (
                        <>
                            <HiCursorClick className="mr-2" />
                            Submit
                        </>
                    )}
                    {pending && <ImSpinner2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );

}

## export default FormSubmitComponent;

import { z } from "zod";

export const formSchema = z.object({
name: z.string().min(4),
description: z.string().optional(),
});

## export type formSchemaType = z.infer<typeof formSchema>;

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("POSTGRES_PRISMA_URL") // uses connection pooling
directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}

model Form {
id Int @id @default(autoincrement())
userId String
createdAt DateTime @default(now())
published Boolean @default(false)
name String
description String @default("")
content String @default("[]")

visits Int @default(0)
submissions Int @default(0)

shareURL String @unique @default(uuid())
FormSubmissions FormSubmissions[]

@@unique([name, userId])
}

model FormSubmissions {
id Int @id @default(autoincrement())
createdAt DateTime @default(now())
formId Int
form Form @relation(fields: [formId], references: [id])

content String
}

---

actions:
"use server";

import prisma from "@/lib/prisma";
import { formSchema, formSchemaType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    const stats = await prisma.form.aggregate({
        where: {
        userId: user.id,
        },
        _sum: {
        visits: true,
        submissions: true,
        },
    });

    const visits = stats._sum.visits || 0;
    const submissions = stats._sum.submissions || 0;

    let submissionRate = 0;

    if (visits > 0) {
        submissionRate = (submissions / visits) * 100;
    }

    const bounceRate = 100 - submissionRate;

    return {
        visits,
        submissions,
        submissionRate,
        bounceRate,
    };

}

export async function CreateForm(data: formSchemaType) {
const validation = formSchema.safeParse(data);
if (!validation.success) {
throw new Error("form not valid");
}

    const user = await currentUser();
    if (!user) {
        throw new UserNotFoundErr();
    }

    const { name, description } = data;

    const form = await prisma.form.create({
        data: {
        userId: user.id,
        name,
        description,
        },
    });

    if (!form) {
        throw new Error("something went wrong");
    }

    return form.id;

}

export async function GetForms() {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    return await prisma.form.findMany({
        where: {
        userId: user.id,
        },
        orderBy: {
        createdAt: "desc",
        },
    });

}

export async function GetFormById(id: number) {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    return await prisma.form.findUnique({
        where: {
        userId: user.id,
        id,
        },
    });

}

export async function UpdateFormContent(id: number, jsonContent: string) {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    return await prisma.form.update({
        where: {
        userId: user.id,
        id,
        },
        data: {
        content: jsonContent,
        },
    });

}

export async function PublishForm(id: number) {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    return await prisma.form.update({
        data: {
        published: true,
        },
        where: {
        userId: user.id,
        id,
        },
    });

}

export async function GetFormContentByUrl(formUrl: string) {
return await prisma.form.update({
select: {
content: true,
},
data: {
visits: {
increment: 1,
},
},
where: {
shareURL: formUrl,
},
});
}

export async function SubmitForm(formUrl: string, content: string) {
return await prisma.form.update({
data: {
submissions: {
increment: 1,
},
FormSubmissions: {
create: {
content,
},
},
},
where: {
shareURL: formUrl,
published: true,
},
});
}

export async function GetFormWithSubmissions(id: number) {
const user = await currentUser();
if (!user) {
throw new UserNotFoundErr();
}

    return await prisma.form.findUnique({
        where: {
        userId: user.id,
        id,
        },
        include: {
        FormSubmissions: true,
        },
    });

## }

now this was the test form created with the corresponding fields and oclumns (i copied the html frm the chrome inspector elements) you should extrct the results and data from it and forget the html:

<div class="ag-root-wrapper-body ag-layout-normal" ref="rootWrapperBody">
                    <!--AG-GRID-COMP--><div class="ag-root ag-unselectable ag-layout-normal" role="grid" unselectable="on" ref="gridPanel" aria-rowcount="2" aria-colcount="12">
        <!--AG-HEADER-ROOT--><div class="ag-header ag-pivot-off" role="presentation" ref="headerRoot" unselectable="on" style="height: 33px; min-height: 33px;">
            <div class="ag-pinned-left-header" ref="ePinnedLeftHeader" role="presentation" style="width: 32px; max-width: 32px; min-width: 32px;"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 32px;"><div class="ag-header-cell" role="presentation" unselectable="on" col-id="checkbox" style="width: 32px; left: 0px;">    <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-31"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-31">
            </div>
        </div><div class="ag-cell-label-container" role="presentation">    <div ref="eLabel" class="ag-header-cell-label" role="presentation" unselectable="on">    <span ref="eText" class="ag-header-cell-text" role="columnheader" unselectable="on" aria-colindex="1"></span>    <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon ag-hidden" aria-hidden="true"><span class="ag-icon ag-icon-filter" unselectable="on"></span></span>                  </div></div></div></div></div>
            <div class="ag-header-viewport" ref="eHeaderViewport" role="presentation">
                <div class="ag-header-container" ref="eHeaderContainer" role="rowgroup" style="width: 2272px; transform: translateX(-52px);"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 2272px;"><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="2" col-id="Form.id" style="width: 96px; left: 0px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-9"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-9">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="id (Int)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">id</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8.0001C0 6.89554 0.89544 6.00015 1.99999 6.00015H22.0001C23.1046 6.00015 24 6.89554 24 8.0001C24 9.10465 23.1046 10.0001 22.0001 10.0001H1.99999C0.89544 10.0001 0 9.10465 0 8.0001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 15.9999C0 14.8954 0.89544 14 1.99999 14H22.0001C23.1046 14 24 14.8954 24 15.9999C24 17.1046 23.1046 17.9998 22.0001 17.9998H1.99999C0.89544 17.9998 0 17.1046 0 15.9999Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29671 0.0223986C10.389 0.186247 11.1418 1.20459 10.9779 2.2969L7.97789 22.2965C7.81404 23.3887 6.7957 24.1414 5.70334 23.9777C4.611 23.8138 3.85829 22.7954 4.02216 21.7032L7.02216 1.70355C7.18601 0.611239 8.20435 -0.141449 9.29671 0.0223986Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2967 0.0223986C19.3891 0.186247 20.1418 1.20459 19.9779 2.2969L16.9779 22.2965C16.8139 23.3887 15.7957 24.1414 14.7033 23.9777C13.611 23.8138 12.8583 22.7954 13.0222 21.7032L16.0222 1.70355C16.186 0.611239 17.2044 -0.141449 18.2967 0.0223986Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="3" col-id="Form.userId" style="width: 200px; left: 96px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-11"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-11">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="userId (String)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">userId</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M18.327 24L16.5266 18.3105H7.4735L5.67304 24H0L8.76437 0H15.2018L24 24H18.327ZM15.2697 14.06C13.6051 8.90463 12.6653 5.98911 12.4502 5.31336C12.2463 4.63761 12.0991 4.10355 12.0085 3.71118C11.6349 5.10627 10.5648 8.55585 8.79833 14.06H15.2697Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="4" col-id="Form.createdAt" style="width: 200px; left: 296px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-13"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-13">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="createdAt (DateTime)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">createdAt</span><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 10V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V10H4ZM0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="5" col-id="Form.published" style="width: 200px; left: 496px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-15"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-15">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="published (Boolean)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">published</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.85714 5C3.07006 5 0 8.13402 0 12C0 15.866 3.07006 19 6.85714 19H17.143C20.9299 19 24 15.866 24 12C24 8.13402 20.9299 5 17.143 5H6.85714ZM6.85714 17.25C9.69746 17.25 12 14.8995 12 12C12 9.10051 9.69746 6.75 6.85714 6.75C4.01683 6.75 1.7143 9.10051 1.7143 12C1.7143 14.8995 4.01683 17.25 6.85714 17.25Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="6" col-id="Form.name" style="width: 200px; left: 696px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-17"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-17">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="name (String)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">name</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M18.327 24L16.5266 18.3105H7.4735L5.67304 24H0L8.76437 0H15.2018L24 24H18.327ZM15.2697 14.06C13.6051 8.90463 12.6653 5.98911 12.4502 5.31336C12.2463 4.63761 12.0991 4.10355 12.0085 3.71118C11.6349 5.10627 10.5648 8.55585 8.79833 14.06H15.2697Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="7" col-id="Form.description" style="width: 200px; left: 896px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-19"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-19">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="description (String)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">description</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M18.327 24L16.5266 18.3105H7.4735L5.67304 24H0L8.76437 0H15.2018L24 24H18.327ZM15.2697 14.06C13.6051 8.90463 12.6653 5.98911 12.4502 5.31336C12.2463 4.63761 12.0991 4.10355 12.0085 3.71118C11.6349 5.10627 10.5648 8.55585 8.79833 14.06H15.2697Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="8" col-id="Form.content" style="width: 376px; left: 1096px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-21"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-21">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="content (String)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">content</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M18.327 24L16.5266 18.3105H7.4735L5.67304 24H0L8.76437 0H15.2018L24 24H18.327ZM15.2697 14.06C13.6051 8.90463 12.6653 5.98911 12.4502 5.31336C12.2463 4.63761 12.0991 4.10355 12.0085 3.71118C11.6349 5.10627 10.5648 8.55585 8.79833 14.06H15.2697Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="9" col-id="Form.visits" style="width: 200px; left: 1472px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-23"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-23">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="visits (Int)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">visits</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8.0001C0 6.89554 0.89544 6.00015 1.99999 6.00015H22.0001C23.1046 6.00015 24 6.89554 24 8.0001C24 9.10465 23.1046 10.0001 22.0001 10.0001H1.99999C0.89544 10.0001 0 9.10465 0 8.0001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 15.9999C0 14.8954 0.89544 14 1.99999 14H22.0001C23.1046 14 24 14.8954 24 15.9999C24 17.1046 23.1046 17.9998 22.0001 17.9998H1.99999C0.89544 17.9998 0 17.1046 0 15.9999Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29671 0.0223986C10.389 0.186247 11.1418 1.20459 10.9779 2.2969L7.97789 22.2965C7.81404 23.3887 6.7957 24.1414 5.70334 23.9777C4.611 23.8138 3.85829 22.7954 4.02216 21.7032L7.02216 1.70355C7.18601 0.611239 8.20435 -0.141449 9.29671 0.0223986Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2967 0.0223986C19.3891 0.186247 20.1418 1.20459 19.9779 2.2969L16.9779 22.2965C16.8139 23.3887 15.7957 24.1414 14.7033 23.9777C13.611 23.8138 12.8583 22.7954 13.0222 21.7032L16.0222 1.70355C16.186 0.611239 17.2044 -0.141449 18.2967 0.0223986Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="10" col-id="Form.submissions" style="width: 200px; left: 1672px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-25"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-25">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="submissions (Int)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">submissions</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8.0001C0 6.89554 0.89544 6.00015 1.99999 6.00015H22.0001C23.1046 6.00015 24 6.89554 24 8.0001C24 9.10465 23.1046 10.0001 22.0001 10.0001H1.99999C0.89544 10.0001 0 9.10465 0 8.0001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 15.9999C0 14.8954 0.89544 14 1.99999 14H22.0001C23.1046 14 24 14.8954 24 15.9999C24 17.1046 23.1046 17.9998 22.0001 17.9998H1.99999C0.89544 17.9998 0 17.1046 0 15.9999Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29671 0.0223986C10.389 0.186247 11.1418 1.20459 10.9779 2.2969L7.97789 22.2965C7.81404 23.3887 6.7957 24.1414 5.70334 23.9777C4.611 23.8138 3.85829 22.7954 4.02216 21.7032L7.02216 1.70355C7.18601 0.611239 8.20435 -0.141449 9.29671 0.0223986Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2967 0.0223986C19.3891 0.186247 20.1418 1.20459 19.9779 2.2969L16.9779 22.2965C16.8139 23.3887 15.7957 24.1414 14.7033 23.9777C13.611 23.8138 12.8583 22.7954 13.0222 21.7032L16.0222 1.70355C16.186 0.611239 17.2044 -0.141449 18.2967 0.0223986Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div></div></div>
            </div>
            <div class="ag-pinned-right-header ag-hidden" ref="ePinnedRightHeader" role="presentation" style="width: 0px; max-width: 0px; min-width: 0px;"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 0px;"></div></div>
        </div>
        <div class="ag-floating-top" ref="eTop" role="presentation" unselectable="on" style="min-height: 0px; height: 0px; display: none; overflow-y: hidden;">
            <div class="ag-pinned-left-floating-top" ref="eLeftTop" role="presentation" unselectable="on" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-floating-top-viewport" ref="eTopViewport" role="presentation" unselectable="on">
                <div class="ag-floating-top-container" ref="eTopContainer" role="presentation" unselectable="on" style="width: 2272px; transform: translateX(-52px);"></div>
            </div>
            <div class="ag-pinned-right-floating-top ag-hidden" ref="eRightTop" role="presentation" unselectable="on"></div>
            <div class="ag-floating-top-full-width-container ag-hidden" ref="eTopFullWidthContainer" role="presentation" unselectable="on"></div>
        </div>
        <div class="ag-body-viewport ag-layout-normal ag-row-no-animation" ref="eBodyViewport" role="presentation" unselectable="on">
            <div class="ag-pinned-left-cols-container" ref="eLeftContainer" role="presentation" unselectable="on" style="height: 32px; width: 32px; max-width: 32px; min-width: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="Form::1" comp-id="33" class="ag-row ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last ag-row-focus" style="height: 32px; transform: translateY(0px);"><div tabindex="-1" unselectable="on" role="presentation" comp-id="45" col-id="checkbox" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height ag-cell-last-left-pinned" style="width: 32px; left: 0px;  "><div ref="eCellWrapper" class="ag-cell-wrapper" role="presentation">
                <div class="ag-selection-checkbox"><!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-47"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-47">
            </div>
        </div></div><span ref="eCellValue" role="gridcell" aria-colindex="1" class="ag-cell-value" unselectable="on"></span></div></div></div></div>
            <div class="ag-center-cols-clipper" ref="eCenterColsClipper" role="presentation" unselectable="on" style="height: 32px;">
                <div class="ag-center-cols-viewport" ref="eCenterViewport" role="presentation" unselectable="on" style="height: calc(100% + 15px);">
                    <div class="ag-center-cols-container" ref="eCenterContainer" role="rowgroup" unselectable="on" style="width: 2272px; height: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="Form::1" comp-id="33" class="ag-row ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last ag-row-focus ag-row-not-inline-editing" style="height: 32px; transform: translateY(0px);"><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="2" comp-id="34" col-id="Form.id" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 96px; left: 0px;"><div class="ag-react-container"><div class="_container_1lgfw_1">1</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="3" comp-id="35" col-id="Form.userId" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value ag-cell-focus" style="width: 200px; left: 96px;"><div class="ag-react-container"><div class="_container_1lgfw_1">user_2jTSyUXbr6mUb71mGytTpcHfbJq</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="4" comp-id="36" col-id="Form.createdAt" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 296px;"><div class="ag-react-container"><div class="_container_1lgfw_1">2024-09-11T11:21:09.289Z</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="5" comp-id="37" col-id="Form.published" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 496px;"><div class="ag-react-container"><div class="_container_1lgfw_1">true</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="6" comp-id="38" col-id="Form.name" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 696px;"><div class="ag-react-container"><div class="_container_1lgfw_1">Patient Personal Information form </div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="7" comp-id="39" col-id="Form.description" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 896px;"><div class="ag-react-container"><div class="_container_1lgfw_1">Personal data information is requested for the purpose of recollecting additional accident data in accordance with the terms of service under the subrogation clause, reason why you may be contacted by VWS.</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="8" comp-id="40" col-id="Form.content" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 376px; left: 1096px;"><div class="ag-react-container"><div class="_container_1lgfw_1">[{"id":"2573","type":"TitleField","extraAttributes":{"title":"Patient Personal Information"}},{"id":"4104","type":"ParagraphField","extraAttributes":{"text":"Personal data information is requested for the purpose of recollecting additional accident data in accordance with the terms of service under the subrogation clause, reason why you may be contacted by VWS."}},{"id":"7184","type":"TextField","extraAttributes":{"label":"First Name","helperText":" ","placeHolder":"Your name..","required":true}},{"id":"3968","type":"TextField","extraAttributes":{"label":"Last Name","helperText":"","placeHolder":"Value here...","required":true}},{"id":"4537","type":"NumberField","extraAttributes":{"label":"Internal Case Id Reference Number","helperText":"You case ID is unique. You may find it in your email or user panel.","placeHolder":"000000","required":true}},{"id":"7883","type":"SelectField","extraAttributes":{"label":"Preferred Language","helperText":"","placeHolder":"English","required":false,"options":["English"]}},{"id":"4124","type":"NumberField","extraAttributes":{"label":"Phone number","helperText":"","placeHolder":"e.g. +1 702 703 7004","required":false}}]</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="9" comp-id="41" col-id="Form.visits" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 1472px;"><div class="ag-react-container"><div class="_container_1lgfw_1">11</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="10" comp-id="42" col-id="Form.submissions" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 1672px;"><div class="ag-react-container"><div class="_container_1lgfw_1">1</div></div></div></div></div>
                </div>
            </div>
            <div class="ag-pinned-right-cols-container ag-hidden" ref="eRightContainer" role="presentation" unselectable="on" style="height: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="Form::1" comp-id="33" class="ag-row ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last ag-row-focus" style="height: 32px; transform: translateY(0px);"></div></div>
            <div class="ag-full-width-container" ref="eFullWidthContainer" role="presentation" unselectable="on" style="height: 32px;"></div>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation" unselectable="on" style="min-height: 0px; height: 0px; display: none; overflow-y: hidden;">
            <div class="ag-pinned-left-floating-bottom" ref="eLeftBottom" role="presentation" unselectable="on" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-floating-bottom-viewport" ref="eBottomViewport" role="presentation" unselectable="on">
                <div class="ag-floating-bottom-container" ref="eBottomContainer" role="presentation" unselectable="on" style="width: 2272px; transform: translateX(-52px);"></div>
            </div>
            <div class="ag-pinned-right-floating-bottom ag-hidden" ref="eRightBottom" role="presentation" unselectable="on"></div>
            <div class="ag-floating-bottom-full-width-container ag-hidden" ref="eBottomFullWidthContainer" role="presentation" unselectable="on"></div>
        </div>
        <div class="ag-body-horizontal-scroll" ref="eHorizontalScrollBody" aria-hidden="true" style="height: 15px; max-height: 15px; min-height: 15px;">
            <div class="ag-horizontal-left-spacer" ref="eHorizontalLeftSpacer" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eBodyHorizontalScrollViewport" style="height: 15px; max-height: 15px; min-height: 15px;">
                <div class="ag-body-horizontal-scroll-container" ref="eBodyHorizontalScrollContainer" style="width: 2272px; height: 15px; max-height: 15px; min-height: 15px;"></div>
            </div>
            <div class="ag-horizontal-right-spacer ag-scroller-corner" ref="eHorizontalRightSpacer" style="width: 0px; max-width: 0px; min-width: 0px;"></div>
        </div>
        <!--AG-OVERLAY-WRAPPER--><div class="ag-overlay ag-hidden" aria-hidden="true" ref="overlayWrapper">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper ag-layout-normal ag-overlay-loading-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>
    </div>
                    
                </div>

                ----

<div class="ag-root ag-unselectable ag-layout-normal" role="grid" unselectable="on" ref="gridPanel" aria-rowcount="2" aria-colcount="6">
        <!--AG-HEADER-ROOT--><div class="ag-header ag-pivot-off" role="presentation" ref="headerRoot" unselectable="on" style="height: 33px; min-height: 33px;">
            <div class="ag-pinned-left-header" ref="ePinnedLeftHeader" role="presentation" style="width: 32px; max-width: 32px; min-width: 32px;"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 32px;"><div class="ag-header-cell" role="presentation" unselectable="on" col-id="checkbox" style="width: 32px; left: 0px;">    <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-132"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-132">
            </div>
        </div><div class="ag-cell-label-container" role="presentation">    <div ref="eLabel" class="ag-header-cell-label" role="presentation" unselectable="on">    <span ref="eText" class="ag-header-cell-text" role="columnheader" unselectable="on" aria-colindex="1"></span>    <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon ag-hidden" aria-hidden="true"><span class="ag-icon ag-icon-filter" unselectable="on"></span></span>                  </div></div></div></div></div>
            <div class="ag-header-viewport" ref="eHeaderViewport" role="presentation">
                <div class="ag-header-container" ref="eHeaderContainer" role="rowgroup" style="width: 1000px; transform: translateX(0px);"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 1000px;"><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="2" col-id="FormSubmissions.id" style="width: 200px; left: 0px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-122"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-122">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="id (Int)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">id</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8.0001C0 6.89554 0.89544 6.00015 1.99999 6.00015H22.0001C23.1046 6.00015 24 6.89554 24 8.0001C24 9.10465 23.1046 10.0001 22.0001 10.0001H1.99999C0.89544 10.0001 0 9.10465 0 8.0001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 15.9999C0 14.8954 0.89544 14 1.99999 14H22.0001C23.1046 14 24 14.8954 24 15.9999C24 17.1046 23.1046 17.9998 22.0001 17.9998H1.99999C0.89544 17.9998 0 17.1046 0 15.9999Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29671 0.0223986C10.389 0.186247 11.1418 1.20459 10.9779 2.2969L7.97789 22.2965C7.81404 23.3887 6.7957 24.1414 5.70334 23.9777C4.611 23.8138 3.85829 22.7954 4.02216 21.7032L7.02216 1.70355C7.18601 0.611239 8.20435 -0.141449 9.29671 0.0223986Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2967 0.0223986C19.3891 0.186247 20.1418 1.20459 19.9779 2.2969L16.9779 22.2965C16.8139 23.3887 15.7957 24.1414 14.7033 23.9777C13.611 23.8138 12.8583 22.7954 13.0222 21.7032L16.0222 1.70355C16.186 0.611239 17.2044 -0.141449 18.2967 0.0223986Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="3" col-id="FormSubmissions.createdAt" style="width: 200px; left: 200px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-124"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-124">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="createdAt (DateTime)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">createdAt</span><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 10V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V10H4ZM0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="4" col-id="FormSubmissions.formId" style="width: 200px; left: 400px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-126"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-126">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="formId (Int)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">formId</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 8.0001C0 6.89554 0.89544 6.00015 1.99999 6.00015H22.0001C23.1046 6.00015 24 6.89554 24 8.0001C24 9.10465 23.1046 10.0001 22.0001 10.0001H1.99999C0.89544 10.0001 0 9.10465 0 8.0001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0 15.9999C0 14.8954 0.89544 14 1.99999 14H22.0001C23.1046 14 24 14.8954 24 15.9999C24 17.1046 23.1046 17.9998 22.0001 17.9998H1.99999C0.89544 17.9998 0 17.1046 0 15.9999Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M9.29671 0.0223986C10.389 0.186247 11.1418 1.20459 10.9779 2.2969L7.97789 22.2965C7.81404 23.3887 6.7957 24.1414 5.70334 23.9777C4.611 23.8138 3.85829 22.7954 4.02216 21.7032L7.02216 1.70355C7.18601 0.611239 8.20435 -0.141449 9.29671 0.0223986Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.2967 0.0223986C19.3891 0.186247 20.1418 1.20459 19.9779 2.2969L16.9779 22.2965C16.8139 23.3887 15.7957 24.1414 14.7033 23.9777C13.611 23.8138 12.8583 22.7954 13.0222 21.7032L16.0222 1.70355C16.186 0.611239 17.2044 -0.141449 18.2967 0.0223986Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="5" col-id="FormSubmissions.form" style="width: 200px; left: 600px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-128"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-128">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1" title="form (Form)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">form</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M9.5452 24V21.1961H8.44912C6.82779 21.1961 6.50809 20.7754 6.50809 18.6723V15.1291C6.50809 13.3829 5.38916 12.2613 3.32256 12.1211V11.8917C5.38916 11.7515 6.50809 10.6171 6.50809 8.88371V5.32767C6.50809 3.22464 6.82779 2.80404 8.44912 2.80404H9.5452V0H7.70696C4.40725 0 3.33397 1.15985 3.33397 4.72863V7.54542C3.33397 9.55924 2.51189 10.3367 0 10.222V13.778C2.51189 13.6761 3.33397 14.4535 3.33397 16.4674V19.2713C3.33397 22.8401 4.40725 24 7.70696 24H9.5452Z"></path><path d="M16.293 24C19.5929 24 20.6659 22.8401 20.6659 19.2713V16.4674C20.6659 14.4535 21.4882 13.6761 24 13.778V10.222C21.4882 10.3367 20.6659 9.55924 20.6659 7.54542V4.72863C20.6659 1.15985 19.5929 0 16.293 0H14.4548V2.80404H15.5509C17.1722 2.80404 17.4919 3.22464 17.4919 5.32767V8.88371C17.4919 10.6171 18.6108 11.7515 20.6774 11.8917V12.1211C18.6108 12.2613 17.4919 13.3829 17.4919 15.1291V18.6723C17.4919 20.7754 17.1722 21.1961 15.5509 21.1961H14.4548V24H16.293Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div><div class="ag-header-cell ag-header-cell-sortable" role="presentation" unselectable="on" aria-colindex="6" col-id="FormSubmissions.content" style="width: 200px; left: 800px;">  <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>  <!--AG-CHECKBOX--><div role="presentation" ref="cbSelectAll" class="ag-header-select-all ag-labeled ag-label-align-right ag-checkbox ag-input-field ag-hidden">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-130"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-130">
            </div>
        </div><div class="ag-react-container"><div data-testid="table__header__cell" class="_container_e5y85_1 _sortable_e5y85_11" title="content (String)" style="width: 200px;"><span data-testid="table__header__cell__title" class="_title_e5y85_15">content</span><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="_icon_f25b9_1"><path d="M18.327 24L16.5266 18.3105H7.4735L5.67304 24H0L8.76437 0H15.2018L24 24H18.327ZM15.2697 14.06C13.6051 8.90463 12.6653 5.98911 12.4502 5.31336C12.2463 4.63761 12.0991 4.10355 12.0085 3.71118C11.6349 5.10627 10.5648 8.55585 8.79833 14.06H15.2697Z"></path></svg><span class="_required_f25b9_8"></span><div class="_spacer_e5y85_22"></div><svg viewBox="0 0 9 7" xmlns="http://www.w3.org/2000/svg" data-test-asc="false" data-test-desc="false" class="_sortIndicator_e5y85_26 _asc_e5y85_37"><path d="M4.5 7L8.39711 0.25H0.602886L4.5 7Z" fill="currentColor"></path></svg></div></div></div></div></div>
            </div>
            <div class="ag-pinned-right-header ag-hidden" ref="ePinnedRightHeader" role="presentation" style="width: 0px; max-width: 0px; min-width: 0px;"><div class="ag-header-row ag-header-row-column" role="row" aria-rowindex="1" style="top: 0px; height: 32px; width: 0px;"></div></div>
        </div>
        <div class="ag-floating-top" ref="eTop" role="presentation" unselectable="on" style="min-height: 0px; height: 0px; display: none; overflow-y: hidden;">
            <div class="ag-pinned-left-floating-top" ref="eLeftTop" role="presentation" unselectable="on" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-floating-top-viewport" ref="eTopViewport" role="presentation" unselectable="on">
                <div class="ag-floating-top-container" ref="eTopContainer" role="presentation" unselectable="on" style="width: 1000px; transform: translateX(0px);"></div>
            </div>
            <div class="ag-pinned-right-floating-top ag-hidden" ref="eRightTop" role="presentation" unselectable="on"></div>
            <div class="ag-floating-top-full-width-container ag-hidden" ref="eTopFullWidthContainer" role="presentation" unselectable="on"></div>
        </div>
        <div class="ag-body-viewport ag-layout-normal ag-row-no-animation" ref="eBodyViewport" role="presentation" unselectable="on">
            <div class="ag-pinned-left-cols-container" ref="eLeftContainer" role="presentation" unselectable="on" style="height: 32px; width: 32px; max-width: 32px; min-width: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="FormSubmissions::1" comp-id="143" class="ag-row ag-row-no-focus ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last" style="height: 32px; transform: translateY(0px); "><div tabindex="-1" unselectable="on" role="presentation" comp-id="149" col-id="checkbox" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height ag-cell-last-left-pinned" style="width: 32px; left: 0px;  "><div ref="eCellWrapper" class="ag-cell-wrapper" role="presentation">
                <div class="ag-selection-checkbox"><!--AG-CHECKBOX--><div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
            <label ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label" for="ag-input-id-151"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper" role="presentation">
                <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-input-id-151">
            </div>
        </div></div><span ref="eCellValue" role="gridcell" aria-colindex="1" class="ag-cell-value" unselectable="on"></span></div></div></div></div>
            <div class="ag-center-cols-clipper" ref="eCenterColsClipper" role="presentation" unselectable="on" style="height: 32px;">
                <div class="ag-center-cols-viewport" ref="eCenterViewport" role="presentation" unselectable="on" style="height: calc(100% + 0px);">
                    <div class="ag-center-cols-container" ref="eCenterContainer" role="rowgroup" unselectable="on" style="width: 1000px; height: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="FormSubmissions::1" comp-id="143" class="ag-row ag-row-no-focus ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last" style="height: 32px; transform: translateY(0px); "><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="2" comp-id="144" col-id="FormSubmissions.id" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 0px;  "><div class="ag-react-container"><div class="_container_1lgfw_1">1</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="3" comp-id="145" col-id="FormSubmissions.createdAt" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 200px;  "><div class="ag-react-container"><div class="_container_1lgfw_1">2024-09-11T12:03:12.749Z</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="4" comp-id="146" col-id="FormSubmissions.formId" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 400px;  "><div class="ag-react-container"><div class="_container_1lgfw_1">1</div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="5" comp-id="147" col-id="FormSubmissions.form" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 600px;  "><div class="ag-react-container"><div class="_container_1lgfw_1 _relation_1lgfw_11"><div data-testid="relation-pill" data-test-null="false" class="_pill_14n8h_1"><span class="_modelName_14n8h_18">Form</span></div></div></div></div><div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="6" comp-id="148" col-id="FormSubmissions.content" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height _tableCell_u5odf_11 ag-cell-value" style="width: 200px; left: 800px;  "><div class="ag-react-container"><div class="_container_1lgfw_1">{"3968":"Segre","4124":"34637023490","4537":"0918229","7184":"Fernando"}</div></div></div></div></div>
                </div>
            </div>
            <div class="ag-pinned-right-cols-container ag-hidden" ref="eRightContainer" role="presentation" unselectable="on" style="height: 32px;"><div role="row" row-index="0" aria-rowindex="2" row-id="FormSubmissions::1" comp-id="143" class="ag-row ag-row-no-focus ag-row-even ag-row-level-0 ag-row-position-absolute ag-row-first ag-row-last" style="height: 32px; transform: translateY(0px); "></div></div>
            <div class="ag-full-width-container" ref="eFullWidthContainer" role="presentation" unselectable="on" style="height: 32px;"></div>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation" unselectable="on" style="min-height: 0px; height: 0px; display: none; overflow-y: hidden;">
            <div class="ag-pinned-left-floating-bottom" ref="eLeftBottom" role="presentation" unselectable="on" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-floating-bottom-viewport" ref="eBottomViewport" role="presentation" unselectable="on">
                <div class="ag-floating-bottom-container" ref="eBottomContainer" role="presentation" unselectable="on" style="width: 1000px; transform: translateX(0px);"></div>
            </div>
            <div class="ag-pinned-right-floating-bottom ag-hidden" ref="eRightBottom" role="presentation" unselectable="on"></div>
            <div class="ag-floating-bottom-full-width-container ag-hidden" ref="eBottomFullWidthContainer" role="presentation" unselectable="on"></div>
        </div>
        <div class="ag-body-horizontal-scroll" ref="eHorizontalScrollBody" aria-hidden="true" style="height: 0px; max-height: 0px; min-height: 0px;">
            <div class="ag-horizontal-left-spacer" ref="eHorizontalLeftSpacer" style="width: 32px; max-width: 32px; min-width: 32px;"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eBodyHorizontalScrollViewport" style="height: 0px; max-height: 0px; min-height: 0px;">
                <div class="ag-body-horizontal-scroll-container" ref="eBodyHorizontalScrollContainer" style="width: 1000px; height: 0px; max-height: 0px; min-height: 0px;"></div>
            </div>
            <div class="ag-horizontal-right-spacer ag-scroller-corner" ref="eHorizontalRightSpacer" style="width: 0px; max-width: 0px; min-width: 0px;"></div>
        </div>
        <!--AG-OVERLAY-WRAPPER--><div class="ag-overlay ag-hidden" aria-hidden="true" ref="overlayWrapper">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper ag-layout-normal ag-overlay-no-rows-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>
    </div>

    ----

now that you'vel earned all this. create a page when a user can input in the resuable search input their submited form
(we should GET frm our db the corresponding columns fields and values) for the "Internal Case Id Reference Number"
and display a read only view of the form they submited. create actions, components, and the page (on a first instance we'll allow all users to access this, but just add a "placeholder" function that we can later use to discriminate by user permision)

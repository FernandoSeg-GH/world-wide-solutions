/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { FormElement, FormElementInstance, SubmitFunction, ElementsType } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form as ShadForm,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useDropzone } from "react-dropzone";

const type: ElementsType = "FileUploadField";

const extraAttributes = {
    label: "Upload File",
    helperText: "Choose a file to upload",
    required: false,
    multiple: true,
};

export const FileUploadFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: UploadIcon,
        label: "File Upload",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,
    validate: (formElement, currentValue) => {
        const element = formElement as CustomInstance;

        if (element.extraAttributes.required) {
            return currentValue.length > 0;
        }
        return true;
    },
};

type CustomInstance = FormElementInstance & {
    extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { label, required, helperText } = element.extraAttributes;
    return (
        <div className="flex flex-col gap-2 w-full">
            <Label>
                {label}
                {required && "*"}
            </Label>
            <Button variant="outline" disabled className="w-full">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload File
            </Button>
            {helperText && (
                <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>
            )}
        </div>
    );
}

function FormComponent({
    elementInstance,
    submitValue,
    isInvalid,
    defaultValue,
    handleFileChange,
}: {
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
    handleFileChange?: (fieldId: string, files: File | File[]) => void;
}) {
    const element = elementInstance as CustomInstance;
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        setError(isInvalid === true);
    }, [isInvalid]);

    const { label, required, helperText, multiple } = element.extraAttributes;

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            console.log('acceptedFiles', acceptedFiles);
            if (acceptedFiles.length === 0) return;

            setSelectedFiles((prevFiles) => {
                const newFiles = multiple
                    ? [...prevFiles, ...acceptedFiles]
                    : acceptedFiles.slice(0, 1);

                console.log('newFiles', newFiles);
                if (handleFileChange) {
                    handleFileChange(element.id, multiple ? newFiles : newFiles[0]);
                }

                if (submitValue) {
                    const value = multiple
                        ? newFiles.map((f) => f.name).join(', ')
                        : newFiles.length > 0
                            ? newFiles[0].name
                            : '';
                    submitValue(element.id, value);
                }
                return newFiles;
            });
        },
        [element.id, handleFileChange, multiple, submitValue]
    );

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        multiple,
    });

    return (
        <div
            key={multiple ? 'multiple' : 'single'} // Force re-mount when `multiple` changes
            className="flex flex-col gap-2 w-full"
        >
            <Label className={cn(error && 'text-red-500')}>
                {label}
                {required && '*'}
            </Label>
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-md p-4 cursor-pointer',
                    error && 'border-red-500',
                    isDragActive && 'border-blue-500'
                )}
            >
                <input {...getInputProps({ required, multiple })} />
                <div className="flex flex-col items-center justify-center py-12">
                    <UploadIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground my-4">
                        {isDragActive
                            ? 'Drop the files here ...'
                            : 'Drag & drop some files here, or click to select files'}
                    </p>
                    <Button variant="outline" className="" onClick={open}>
                        Select Files
                    </Button>
                </div>
            </div>
            {helperText && (
                <p
                    className={cn(
                        'text-muted-foreground text-[0.8rem]',
                        error && 'text-red-500'
                    )}
                >
                    {helperText}
                </p>
            )}
            {selectedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-4">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {isImage(file) ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="h-16 w-16 object-cover rounded-md"
                                />
                            ) : (
                                getFileIcon(file)
                            )}
                            <p className="text-sm">{file.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}



const propertiesSchema = z.object({
    label: z.string().min(2).max(50),
    helperText: z.string().max(200),
    required: z.boolean().default(false),
    multiple: z.boolean(),
});

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const form = useForm<PropertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
        mode: 'onBlur',
        defaultValues: element.extraAttributes,
    });

    useEffect(() => {
        form.reset(element.extraAttributes);
    }, [element, form]);

    function applyChanges(values: PropertiesFormSchemaType) {
        // Create a new object to ensure React detects the change
        element.extraAttributes = { ...values };
    }

    return (
        <ShadForm {...form}>
            <form
                onBlur={form.handleSubmit(applyChanges)}
                onSubmit={(e) => {
                    e.preventDefault();
                }}
                className="space-y-3"
            >
                <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                The label of the field, displayed above.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="helperText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Helper Text</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                />
                            </FormControl>
                            <FormDescription>Displayed below the field.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>Is this field required?</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="multiple"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Allow Multiple Files</FormLabel>
                                <FormDescription>Allow multiple file uploads?</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </ShadForm>
    );
}

import { ImageIcon, FileTextIcon, FileXIcon } from "lucide-react"; // Import necessary icons

// Helper function to check if a file is an image
const isImage = (file: File) => {
    return file.type.startsWith("image/");
};

// Function to get the appropriate icon based on file type
const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
        return <FileTextIcon className="h-6 w-6 text-gray-500" />;
    } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
    ) {
        return <FileTextIcon className="h-6 w-6 text-blue-500" />;
    } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/csv"
    ) {
        return <FileXIcon className="h-6 w-6 text-green-500" />;
    } else {
        return <FileTextIcon className="h-6 w-6 text-gray-500" />;
    }
};

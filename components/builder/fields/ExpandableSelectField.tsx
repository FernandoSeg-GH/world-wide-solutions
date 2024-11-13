
"use client";

import React, { useEffect, useState } from "react";
import {
    ElementsType,
    FormElement,
    FormElementInstance,
    SubmitFunction,
    Option,
    NestedOption,
} from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { RxDropdownMenu } from "react-icons/rx";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppProvider";
import { cn } from "@/lib/utils";
import { Control, UseFormRegister } from 'react-hook-form';
import { Switch } from "@/components/ui/switch";

const type: ElementsType = "ExpandableSelectField";

const extraAttributes = {
    label: "Select Pro",
    helperText: "Select an option to see sub-options.",
    required: false,
    placeHolder: "Choose an option...",
    options: [] as Array<Option | NestedOption>,
};

const propertiesSchema = z.object({
    label: z.string().min(2).max(50),
    helperText: z.string().max(200).optional(),
    required: z.boolean().default(false),
    placeHolder: z.string().max(50).optional(),
    options: z
        .array(
            z.object({
                label: z.string(),
                value: z.string(),
                subOptions: z
                    .array(
                        z.object({
                            label: z.string(),
                            value: z.string(),
                        })
                    )
                    .optional(),
            })
        )
        .default([]),
});

export const ExpandableSelectFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: RxDropdownMenu,
        label: "Select Pro",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,

    validate: (
        formElement: FormElementInstance,
        currentValue: string
    ): boolean => {
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


function DesignerComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
}) {
    const element = elementInstance as CustomInstance;
    const { label, required, placeHolder, helperText, options } =
        element.extraAttributes;

    return (
        <div className="flex flex-col gap-2 w-full">
            <Label>
                {label}
                {required && "*"}
            </Label>
            <Select>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeHolder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <React.Fragment key={option.value}>
                            <SelectItem value={option.value}>{option.label}</SelectItem>
                            {"subOptions" in option &&
                                option.subOptions &&
                                option.subOptions.map((subOption) => (
                                    <SelectItem
                                        key={subOption.value}
                                        value={subOption.value}
                                    >
                                        &nbsp;&nbsp;{subOption.label}
                                    </SelectItem>
                                ))}
                        </React.Fragment>
                    ))}
                </SelectContent>
            </Select>
            {helperText && (
                <p className="text-muted-foreground text-[0.8rem]">
                    {helperText}
                </p>
            )}
        </div>
    );
}


function FormComponent({
    elementInstance,
    submitValue,
    isInvalid,
    defaultValue,
}: {
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
}) {
    const element = elementInstance as CustomInstance;
    const [value, setValue] = useState(defaultValue || "");
    const [error, setError] = useState(false);
    const [selectedMainOption, setSelectedMainOption] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setError(isInvalid === true);
    }, [isInvalid]);

    const { label, required, placeHolder, helperText, options } =
        element.extraAttributes;


    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const selectedOption = options.find(
        (opt) => opt.value === selectedMainOption
    ) as NestedOption | undefined;
    const subOptions = selectedOption?.subOptions || [];

    return (
        <div className="flex flex-col gap-2 w-full">
            <Label className={cn(error && "text-red-500")}>
                {label}
                {required && "*"}
            </Label>
            <Select
                value={selectedMainOption || ""}
                onValueChange={(val) => {
                    setValue(val);
                    setSelectedMainOption(val);
                    if (!submitValue) return;
                    const valid = ExpandableSelectFieldFormElement.validate(element, val);
                    setError(!valid);
                    submitValue(element.id, val);
                }}
            >
                <SelectTrigger className={cn("w-full", error && "border-red-500")}>
                    <SelectValue placeholder={placeHolder} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-scroll">
                    <Input
                        type="text"
                        placeholder="Search options..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 mb-2 border rounded"
                    />
                    {filteredOptions.map((option) => (
                        <React.Fragment key={option.value}>
                            <SelectItem value={option.value}>{option.label}</SelectItem>
                            {"subOptions" in option &&
                                option.subOptions &&
                                option.subOptions.map((subOption) => (
                                    <SelectItem
                                        key={subOption.value}
                                        value={subOption.value}
                                    >
                                        &nbsp;&nbsp;{subOption.label}
                                    </SelectItem>
                                ))}
                        </React.Fragment>
                    ))}
                    {filteredOptions.length === 0 && (
                        <p className="text-gray-500 p-2">No options found</p>
                    )}
                </SelectContent>
            </Select>
            {helperText && (
                <p
                    className={cn(
                        "text-muted-foreground text-[0.8rem]",
                        error && "text-red-500"
                    )}
                >
                    {helperText}
                </p>
            )}
            {/* Display sub-options if a main option with sub-options is selected */}
            {subOptions.length > 0 && (
                <Select
                    value={value}
                    onValueChange={(val) => {
                        setValue(val);
                        if (!submitValue) return;
                        const valid = ExpandableSelectFieldFormElement.validate(element, val);
                        setError(!valid);
                        submitValue(element.id, val);
                    }}
                >
                    <SelectTrigger className={cn("w-full mt-2", error && "border-red-500")}>
                        <SelectValue placeholder="Select a sub-option..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-scroll">
                        {subOptions.map((subOption) => (
                            <SelectItem key={subOption.value} value={subOption.value}>
                                {subOption.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}

function PropertiesComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
}) {
    const element = elementInstance as CustomInstance;
    const { actions, selectors } = useAppContext();
    const { formActions } = actions;
    const { setSelectedElement } = selectors;

    const form = useForm<PropertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
        mode: 'onSubmit',
        defaultValues: {
            label: element.extraAttributes.label,
            helperText: element.extraAttributes.helperText,
            required: element.extraAttributes.required,
            placeHolder: element.extraAttributes.placeHolder,
            options: element.extraAttributes.options,
        },
    });

    const { control, handleSubmit, register } = form;

    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({
        control,
        name: 'options',
    });

    useEffect(() => {
        form.reset(element.extraAttributes);
    }, [element, form]);

    function applyChanges(values: PropertiesFormSchemaType) {
        formActions.updateElement(element.id, {
            ...element,
            extraAttributes: {
                label: values.label,
                helperText: values.helperText,
                placeHolder: values.placeHolder,
                required: values.required,
                options: values.options,
            },
        });

        toast({
            title: 'Success',
            description: 'Properties saved successfully',
        });

        setSelectedElement(null);
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(applyChanges)} className="space-y-3">
                {/* Editable fields */}
                <FormField
                    control={control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Field label" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="helperText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Helper Text</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Helper text" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="placeHolder"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Placeholder</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Placeholder text" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="options"
                    render={() => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel>Options</FormLabel>
                                <Button
                                    variant={'outline'}
                                    className="gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        optionsAppend({
                                            label: 'New Option',
                                            value: 'new_option',
                                            subOptions: [],
                                        });
                                    }}
                                >
                                    <AiOutlinePlus />
                                    Add Option
                                </Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                {optionsFields.map((option, index) => (
                                    <div key={option.id} className="border p-2 rounded-md">
                                        <div className="flex items-center justify-between gap-1">
                                            <Input
                                                placeholder="Label"
                                                {...register(`options.${index}.label` as const)}
                                            />
                                            <Input
                                                placeholder="Value"
                                                {...register(`options.${index}.value` as const)}
                                            />
                                            <Button
                                                variant={'ghost'}
                                                size={'icon'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    optionsRemove(index);
                                                }}
                                            >
                                                <AiOutlineClose />
                                            </Button>
                                        </div>
                                        {/* Sub-options Section */}
                                        <div className="mt-2 ml-4">
                                            <SubOptions
                                                nestIndex={index}
                                                control={control}
                                                register={register}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <FormDescription>
                                Define the options and their sub-options for the select field.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="required"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Required</FormLabel>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className="w-full" type="submit">
                    Save
                </Button>
            </form>
        </Form>
    );
}

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function SubOptions({
    nestIndex,
    control,
    register,
}: {
    nestIndex: number;
    control: Control<PropertiesFormSchemaType>;
    register: UseFormRegister<PropertiesFormSchemaType>;
}) {
    const {
        fields: subOptionsFields,
        append: subOptionsAppend,
        remove: subOptionsRemove,
    } = useFieldArray({
        control,
        name: `options.${nestIndex}.subOptions` as const,
    });

    return (
        <div>
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">Sub-options</p>
                <Button
                    variant={'outline'}
                    size={'sm'}
                    className="gap-2 mb-2"
                    onClick={(e) => {
                        e.preventDefault();
                        subOptionsAppend({ label: 'New Sub-option', value: 'new_sub_option' });
                    }}
                >
                    <AiOutlinePlus />
                    Add Sub-option
                </Button>
            </div>
            {subOptionsFields.map((subOption, subIndex) => (
                <div key={subOption.id} className="flex items-center justify-between gap-1">
                    <Input
                        placeholder="Sub-option Label"
                        {...register(
                            `options.${nestIndex}.subOptions.${subIndex}.label` as const
                        )}
                    />
                    <Input
                        placeholder="Sub-option Value"
                        {...register(
                            `options.${nestIndex}.subOptions.${subIndex}.value` as const
                        )}
                    />
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        onClick={(e) => {
                            e.preventDefault();
                            subOptionsRemove(subIndex);
                        }}
                    >
                        <AiOutlineClose />
                    </Button>
                </div>
            ))}
        </div>
    );
}

interface CheckboxProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onCheckedChange,
}) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
            className="checkbox-class"
        />
    );
};
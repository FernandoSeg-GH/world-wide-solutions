"use client";

import {
    ElementsType,
    FormElement,
    FormElementInstance,
    SubmitFunction,
} from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { RxDropdownMenu } from "react-icons/rx";
import {
    Form,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { toast } from "@/components/ui/use-toast";
import { useAppContext } from "@/context/AppProvider";
import { Switch } from "@/components/ui/switch";

const type: ElementsType = "SelectField";

const extraAttributes = {
    label: "Select field",
    helperText: "Helper text",
    required: false,
    placeHolder: "Value here...",
    options: [] as { label: string; value: string }[],
};

const propertiesSchema = z.object({
    label: z.string().min(2).max(50),
    helperText: z.string().max(200),
    required: z.boolean().default(false),
    placeHolder: z.string().max(50),
    options: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});

export const SelectFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: RxDropdownMenu,
        label: "Select Field",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,

    validate: (formElement: FormElementInstance, currentValue: string): boolean => {
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
    const { label, required, placeHolder, helperText } = element.extraAttributes;
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
            </Select>
            {helperText && <p className="text-muted-foreground text-[0.8rem]">{helperText}</p>}
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
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setError(isInvalid === true);
    }, [isInvalid]);

    const { label, required, placeHolder, helperText, options } = element.extraAttributes;

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2 w-full">
            <Label className={cn(error && "text-red-500")}>
                {label}
                {required && "*"}
            </Label>
            <Select
                defaultValue={value}
                onValueChange={(value) => {
                    setValue(value);
                    if (!submitValue) return;
                    const valid = SelectFieldFormElement.validate(element, value);
                    setError(!valid);
                    submitValue(element.id, value);
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
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            style={{
                                backgroundColor: value === option.value ? "#64748b" : "transparent",
                                color: value === option.value ? "white" : "inherit",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#64748b";
                                e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "inherit";
                            }}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                    {filteredOptions.length === 0 && (
                        <p className="text-gray-500 p-2">No options found</p>
                    )}
                </SelectContent>
            </Select>
            {helperText && <p className={cn("text-muted-foreground text-[0.8rem]", error && "text-red-500")}>{helperText}</p>}
        </div>
    );
}

type PropertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { actions, selectors } = useAppContext();
    const { formActions } = actions;
    const { setSelectedElement } = selectors;

    const form = useForm<PropertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
        mode: "onSubmit",
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
            title: "Success",
            description: "Properties saved successfully",
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
                {/* Options */}
                <FormField
                    control={control}
                    name="options"
                    render={() => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel>Options</FormLabel>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        optionsAppend({
                                            label: 'New Option',
                                            value: 'new_option',
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
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    optionsRemove(index);
                                                }}
                                            >
                                                <AiOutlineClose />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <FormDescription>
                                Define the options for the select field.
                            </FormDescription>
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

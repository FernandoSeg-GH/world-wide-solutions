import { useForm, FormProvider } from "react-hook-form";
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
import { FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/AppContext";
import { useState } from "react";

type FormValues = {
    name: string;
    description: string;
};

function CreateFormBtn() {
    const router = useRouter();
    const { actions } = useAppContext();
    const { createForm } = actions;

    const methods = useForm<FormValues>();
    const { handleSubmit, formState: { errors, isSubmitting } } = methods;

    const [isLoading, setIsLoading] = useState(false); // For manual control over loading state

    async function onSubmit(values: FormValues) {
        setIsLoading(true); // Set loading state to true
        try {
            const result = await createForm({
                name: values.name,
                description: values.description,

            });

            if (result?.formId && result?.shareURL) {
                setTimeout(() => {
                    router.push(`/builder/${result.shareURL}`);
                }, 1000);
            } else {
                throw new Error("Form creation failed.");
            }
        } catch (error) {
            console.error("Error creating form:", error);
        } finally {
            setIsLoading(false); // Set loading state back to false after form creation
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className="group border border-primary/20 h-[200px] min-w-[280px] max-w-[450px] w-full items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4"
                >
                    <BsFileEarmarkPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    <p className="font-bold text-xl text-muted-foreground group-hover:text-primary">Create new form</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] md:w-full">
                <DialogHeader>
                    <DialogTitle>Create form</DialogTitle>
                    <DialogDescription>Create a new form to start collecting responses</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...methods.register("name", {
                                        required: "Name is required",
                                        minLength: { value: 3, message: "Name should be at least 3 characters long" },
                                    })}
                                />
                            </FormControl>
                            {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
                        </FormItem>

                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={5}
                                    {...methods.register("description", {
                                        // required: "Description is required",
                                        // minLength: { value: 10, message: "Description should be at least 10 characters long" },
                                    })}
                                />
                            </FormControl>
                            {errors.description && <FormMessage>{errors.description.message}</FormMessage>}
                        </FormItem>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading} // Disable when form is submitting or loading
                                className={`w-full mt-4 ${isLoading ? 'animate-pulse bg-primary' : ''}`}
                            >
                                {!isLoading && !isSubmitting && <span>Save</span>}
                                {(isLoading || isSubmitting) && (
                                    <div className="flex items-center space-x-2">
                                        <ImSpinner2 className="animate-spin" />
                                        <span>Creating your form...</span>
                                    </div>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}

export default CreateFormBtn;

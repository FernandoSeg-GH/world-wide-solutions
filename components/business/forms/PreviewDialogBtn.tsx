import React from "react";
import { Button } from "@/components/ui/button";
import { MdPreview } from "react-icons/md";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormElements } from "./FormElements";
import { useAppContext } from "@/context/AppProvider";

function PreviewDialogBtn() {
    const { data } = useAppContext();
    const { elements } = data;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"} className="gap-2">
                    <MdPreview className="h-6 w-6" />
                    Preview
                </Button>
            </DialogTrigger>
            <DialogContent className="w-screen h-screen max-h-screen max-w-full flex flex-col flex-grow p-0 gap-0">
                <DialogHeader>
                    <DialogTitle>Form preview</DialogTitle>
                    <DialogDescription>This is how your form will look like to your users.</DialogDescription>
                </DialogHeader>
                <div className="bg-accent flex flex-col flex-grow items-center justify-center p-4 bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)] overflow-y-auto">
                    <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background h-full w-full rounded-2xl p-8 overflow-y-auto">
                        {elements.map((element) => {
                            const formElement = FormElements[element.type];
                            if (!formElement || !formElement.formComponent) {
                                console.warn(`No formComponent found for type: ${element.type}`);
                                return (
                                    <div key={element.id} className="text-red-500">
                                        Unknown field type: {element.type}
                                    </div>
                                );
                            }
                            const FormComponent = formElement.formComponent;
                            return <FormComponent key={element.id} elementInstance={element} />;
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default PreviewDialogBtn;

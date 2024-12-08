import React, { useState, useEffect } from "react";
import { Form, Submission } from '@/types';
import { useSubmissions } from '@/hooks/forms/useSubmissions';
import { toast } from "@/components/ui/use-toast";
import {
    FaParagraph,
    FaSlidersH,
    FaMinusCircle,
    FaFileAlt,
    FaQuestionCircle,
    FaClipboardList,
    FaCalendarAlt,
    FaPhone,
    FaCheckSquare,
    FaFileUpload,
} from 'react-icons/fa';
import { VscDebugBreakpointDataUnverified, VscDebugBreakpointLog, VscDebugBreakpointFunction } from "react-icons/vsc";
import { GoMultiSelect } from "react-icons/go";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExpandableSelectFieldFormElement } from "@/components/builder/fields/ExpandableSelectField";
import Image from "next/image";
import { useSession } from "next-auth/react";

export const iconMap: { [key: string]: React.ComponentType } = {
    TextField: VscDebugBreakpointDataUnverified,
    TitleField: VscDebugBreakpointLog,
    SubTitleField: VscDebugBreakpointFunction,
    ParagraphField: FaParagraph,
    SeparatorField: FaSlidersH,
    SpacerField: FaMinusCircle,
    NumberField: FaClipboardList,
    TextAreaField: FaFileAlt,
    DateField: FaCalendarAlt,
    SelectField: GoMultiSelect,
    TelephoneField: FaPhone,
    CheckboxField: FaCheckSquare,
    FileUploadField: FaFileUpload,
};

interface SubmissionCardProps {
    submission: Submission;
    form: Form;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, form }) => {
    const { content } = submission;
    const fields = React.useMemo(() => form.fields || [], [form.fields]);
    const { updateSubmissionContent } = useSubmissions();
    const { data: session } = useSession()
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialContent: Record<string, string> = {};
        fields.forEach((field) => {
            const fieldId = field.id;
            initialContent[fieldId] = content ? content[fieldId] || "" : "";
        });
        setEditedContent(initialContent);
    }, [fields, content]);

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedContent(content || {});
    };

    const handleSaveClick = async () => {
        try {
            await updateSubmissionContent(submission.id, JSON.stringify(editedContent), form.id);
            setIsEditing(false);
            toast({ title: "Success", description: "Submission updated successfully.", variant: "default" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update submission.", variant: "destructive" });
        }
    };

    const handleChange = (fieldId: string, value: string) => {
        setEditedContent((prev) => ({ ...prev, [fieldId]: value }));
    };

    return (
        <Card className="max-w-3xl mb-6 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between w-full">
                <div className="">
                    <CardTitle>{form.name}</CardTitle>
                    <p>Patient: NOMBE DEL PACIENTE</p>
                    <CardDescription>
                        Submission ID: <span>{submission.id}</span>
                    </CardDescription>
                    <p className="text-sm text-gray-500">Submitted At: {new Date(submission.created_at).toLocaleString()}</p>
                </div>
                <Image src={"https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/logo.avif"} width={200} height={50} alt="VWSolutions" />
            </CardHeader>
            <CardContent className="space-y-4 bg-white py-6">
                {fields.map((field) => {
                    const fieldId = field.id;
                    const label = field.extraAttributes?.label || field.extraAttributes?.title || field.extraAttributes?.text || `Field ${fieldId}`;
                    const type = field.type;
                    const IconComponent = iconMap[type] || FaQuestionCircle;

                    if (type === "SeparatorField" || type === "SpacerField") return <Separator key={fieldId} />;

                    const value = content ? content[fieldId] || "" : "";

                    if (type === "TitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <span className="mr-2 text-gray-600 text-2xl"><IconComponent /></span>
                                <span className="text-xl font-semibold text-gray-800">{label}</span>
                            </div>
                        );
                    }

                    if (type === "SubTitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <span className="mr-2 text-gray-500 text-xl"><IconComponent /></span>
                                <span className="text-lg font-medium text-gray-700">{label}</span>
                            </div>
                        );
                    }

                    if (type === "ParagraphField") {
                        return (
                            <div key={fieldId} className="flex items-start mb-2">
                                <p className="text-gray-600 text-base">{label}</p>
                            </div>
                        );
                    }


                    if (field.type === "ExpandableSelectField" && isEditing) {
                        return (
                            <ExpandableSelectFieldFormElement.formComponent
                                key={field.id}
                                elementInstance={field}
                                submitValue={(fieldId, selectedValue) => handleChange(fieldId, selectedValue)}
                                defaultValue={editedContent[field.id]}
                                isInvalid={!editedContent[field.id]}
                            />
                        );
                    }

                    if (isEditing) {
                        return (
                            <div key={fieldId} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="mr-2 text-gray-500"><IconComponent /></span>
                                    <span className="font-semibold text-gray-800">{label}:</span>
                                </div>
                                <div className="w-full max-w-80">
                                    {(() => {
                                        switch (type) {
                                            case "TextField":
                                            case "NumberField":
                                            case "TelephoneField":
                                                return <Input value={editedContent[fieldId]} onChange={(e) => handleChange(fieldId, e.target.value)} />;
                                            case "TextAreaField":
                                                return <Textarea value={editedContent[fieldId]} onChange={(e) => handleChange(fieldId, e.target.value)} />;
                                            case "DateField":
                                                return <Input type="date" value={editedContent[fieldId]} onChange={(e) => handleChange(fieldId, e.target.value)} />;
                                            case "SelectField":
                                                return (
                                                    <Select value={editedContent[fieldId]} onValueChange={(value) => handleChange(fieldId, value)}>
                                                        <SelectTrigger>Select an option</SelectTrigger>
                                                        <SelectContent className="max-h-[300px] overflow-y-auto z-50">
                                                            {field.extraAttributes?.options?.map((option, index) => (
                                                                <SelectItem key={index} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                );
                                            case "CheckboxField":
                                                return <Checkbox checked={editedContent[fieldId] === "true"} onCheckedChange={(checked) => handleChange(fieldId, checked ? "true" : "false")} />;
                                            default:
                                                return <Input value={editedContent[fieldId]} onChange={(e) => handleChange(fieldId, e.target.value)} />;
                                        }
                                    })()}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={fieldId} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="mr-2 text-gray-500"><IconComponent /></span>
                                <span className="font-semibold text-gray-800">{label}:</span>
                            </div>
                            {type === "FileUploadField" && Array.isArray(value) ? (
                                <div>
                                    {value.map((fileUrl, idx) => (
                                        <a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                            File {idx + 1}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span>{value || "N/A"}</span>
                            )}
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter className="space-x-2 border-t pt-6">
                {!isEditing ? (
                    <div className="flex items-center justify-end w-full">
                        <Button onClick={handleEditClick} variant="default">Edit Information</Button>
                    </div>
                ) : (
                    <>
                        <Button onClick={handleSaveClick} variant="default">Save</Button>
                        <Button onClick={handleCancelClick} variant="secondary">Cancel</Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

export default SubmissionCard;





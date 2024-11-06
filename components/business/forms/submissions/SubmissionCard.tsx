import React from "react";
import { ElementsType, Form, Submission } from '@/types';

import {
    FaTextHeight,
    FaHeading,
    FaParagraph,
    FaSlidersH,
    FaFileUpload,
    FaCalendarAlt,
    FaPhone,
    FaCheckSquare,
    FaUpload,
    FaClipboardList,
    FaMinusCircle,
    FaFileAlt,
    FaQuestionCircle,
} from 'react-icons/fa';
import { VscDebugBreakpointDataUnverified, VscDebugBreakpointLog, VscDebugBreakpointFunction } from "react-icons/vsc";
import { GoMultiSelect } from "react-icons/go";

export const iconMap = {
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

const SubmissionCard = ({ submission, form }: { submission: Submission, form: Form }) => {
    const { content } = submission;
    const fields = form.fields || [];

    const informationalFields = ["TitleField", "SubTitleField", "ParagraphField"];
    const separatorFields = ["SeparatorField"];

    return (
        <div className="border border-gray-200 rounded-lg p-6 shadow-lg max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{form.name}</h3>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Submission ID: <span className="underline">{submission.id}</span></h2>
            <p className="text-sm text-gray-500 mb-4">
                Submitted At: {new Date(submission.created_at).toLocaleString()}
            </p>
            <div className="mt-4 space-y-4">
                {fields.map((field) => {
                    const fieldId = field.id.toString();
                    const label =
                        field.extraAttributes?.label ||
                        field.extraAttributes?.title ||
                        field.extraAttributes?.text ||
                        `Field ${fieldId}`;
                    const type = field.type;
                    const IconComponent = iconMap[type] || FaQuestionCircle;

                    if (separatorFields.includes(type)) {
                        return <hr key={fieldId} className="my-6 border-t border-gray-300" />;
                    }

                    const value = content ? content[fieldId] : "N/A";

                    if (type === "TitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <IconComponent className="mr-2 text-gray-600 text-2xl" />
                                <span className="text-xl font-semibold text-gray-800">{label}</span>
                            </div>
                        );
                    }

                    if (type === "SubTitleField") {
                        return (
                            <div key={fieldId} className="flex items-center mb-2">
                                <IconComponent className="mr-2 text-gray-500 text-xl" />
                                <span className="text-lg font-medium text-gray-700">{label}</span>
                            </div>
                        );
                    }

                    if (type === "ParagraphField") {
                        return (
                            <div key={fieldId} className="flex items-start mb-2">
                                {/* <IconComponent className="mr-2 text-gray-500" /> */}
                                <p className="text-gray-600 text-base">{label}</p>
                            </div>
                        );
                    }

                    return (
                        <div key={fieldId} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <IconComponent className="mr-2 text-gray-500" />
                                <span className="font-semibold text-gray-800">{label}:</span>
                            </div>
                            <span className="text-gray-700 capitalize">{value || "N/A"}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubmissionCard;
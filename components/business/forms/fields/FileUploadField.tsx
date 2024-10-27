import React from 'react';
import { FormElementInstance } from '@/types';

export const FileUploadFieldFormElement: React.FC<{
    elementInstance: FormElementInstance;
    submitValue?: (key: string, value: string) => void;
    isInvalid?: boolean;
    defaultValue?: string;
}> = ({ elementInstance, submitValue, isInvalid, defaultValue }) => {
    const [file, setFile] = React.useState<File | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // if (event.target.files && event.target.files[0]) {
        //     setFile(event.target.files[0]);
        //     submitValue && submitValue(elementInstance.id, event.target.files[0]);
        // }
    };

    return (
        <div>
            <label>{elementInstance.extraAttributes?.label}</label>
            <input type="file" onChange={handleChange} />
            {isInvalid && <p className="text-red-500">This field is required.</p>}
        </div>
    );
};

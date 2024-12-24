"use client"
import React, { forwardRef } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import "react-phone-input-2/lib/style.css";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

interface CustomPhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: string;
    onChange: (value: string, data: any, event: any, formattedValue: string) => void;
    defaultCountry?: string;
    className?: string;
    placeholder?: string;
}

const CustomPhoneInput = forwardRef<HTMLInputElement, CustomPhoneInputProps>(
    ({ value, onChange, defaultCountry = "us", className, placeholder, id, ...props }, ref) => {


        return (
            <PhoneInput
                country={defaultCountry}
                value={value}
                onChange={onChange}
                style={{ width: "100%" }}
                inputProps={{
                    // ref,
                    id,
                    placeholder,
                    ...props,
                }}
                inputClass={cn(
                    "flex h-9 !w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                buttonClass="border-input bg-transparent"
            />
        );
    }
);

CustomPhoneInput.displayName = "CustomPhoneInput";

export default CustomPhoneInput;

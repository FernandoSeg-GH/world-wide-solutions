// types/react-phone-input-2.d.ts

declare module "react-phone-input-2" {
  import * as React from "react";

  export interface PhoneInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    country?: string;
    value?: string;
    onChange?: (
      value: string,
      data: any,
      event: any,
      formattedValue: string
    ) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    inputClass?: string;
    buttonClass?: string;
    disableDropdown?: boolean;
    disableSearchIcon?: boolean;
    disableSearch?: boolean;
    disableCountryCode?: boolean;
    regions?: string[];
    disableAutoCountry?: boolean;
    countryCodeEditable?: boolean;
    enableSearch?: boolean;
    disableCountryPicker?: boolean;
    disablePlaceholder?: boolean;
    onSelect?: (country: any) => void;
    placeholder?: string;
    // Add any other props you use
  }

  const PhoneInput: React.FC<PhoneInputProps>;

  export default PhoneInput;
}

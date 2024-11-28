import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-muted-dark",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }


// src/components/ui/input.tsx

// import * as React from "react";
// import dynamic from "next/dynamic";
// import { cn } from "@/lib/utils";

// // Dynamically import react-phone-input-2 with SSR disabled
// const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

// // Import the CSS for react-phone-input-2
// import "react-phone-input-2/lib/style.css";

// export interface InputProps
//   extends React.InputHTMLAttributes<HTMLInputElement> {
//   isPhone?: boolean;
//   onPhoneChange?: (value: string) => void;
//   defaultCountry?: string;
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, type, isPhone, onPhoneChange, defaultCountry = "us", ...props }, ref) => {
//     if (isPhone) {
//       return (
//         <PhoneInput
//           country={defaultCountry}
//           inputClass={cn(
//             "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
//             className
//           )}
//           buttonClass="border-input bg-transparent file:text-foreground"
//           onChange={onPhoneChange}
//           inputProps={{
//             ref,
//             ...props,
//           }}
//         />
//       );
//     }

//     return (
//       <input
//         type={type}
//         className={cn(
//           "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     );
//   }
// );
// Input.displayName = "Input";

// export { Input };


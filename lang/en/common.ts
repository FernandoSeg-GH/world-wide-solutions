import { CommonKeys } from "../tokens/common";

const commonEn: { [k in CommonKeys]: string } = {
  [CommonKeys.title]: "Acceptance of My Way Terms and Conditions",
  [CommonKeys.accept]: "Accept",
  [CommonKeys.acceptTerms]:
    "I have read, understood, and accept the **terms and conditions** and the **[privacy policy](/privacy-policy?lang=en)**.",
  [CommonKeys.validateConsent]: "You must accept the terms with the checkbox",
  [CommonKeys.error]: "Error. Your code isn't valid",
  [CommonKeys.errorNoParams]: "No student or family detected",
  [CommonKeys.loading]: "Loading",
  [CommonKeys.send]: "Send",
};

export default commonEn;

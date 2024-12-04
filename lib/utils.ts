import { EditableClaim } from "@/components/business/forms/custom/accident-claim/config/types";
import { BrandColors } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { formatDistance } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== typeof obj2 || obj1 == null || obj2 == null) return false;

  if (typeof obj1 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function transformKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = transformKeys(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}

export const getLogoForDomain = (businessId: number) => {
  switch (businessId) {
    case 1:
      return "logo.png";
    case 2:
      return "vws.png";

    default:
      return "logo.png";
  }
};

export const brand = {
  blue: {
    primary: BrandColors.BluePrimary,
    secondary: BrandColors.BlueSecondary,
  },
  purple: {
    primary: BrandColors.Purple,
  },
  lightBlue: {
    primary: BrandColors.LightBlue,
  },
  navyBlue: {
    primary: BrandColors.NavyBlue,
  },
  cyan: {
    primary: BrandColors.Cyan,
  },
  neutral: {
    white: BrandColors.White,
    black: BrandColors.Black,
  },
};

// src/lib/utils.ts

export function flattenClaimData(claim: EditableClaim): Record<string, any> {
  return {
    claim_id: claim.claim_id,
    full_name: claim.full_name,
    email: claim.email,
    country: claim.country,
    state: claim.state,
    primary_contact: claim.primary_contact,
    accident_date: claim.accident_date,
    accident_place: claim.accident_place,
    accident_type: claim.accident_type,
    sub_accident_type: claim.sub_accident_type,
    mva_type: claim.mva_type,
    mva_location: claim.mva_location,
    vehicle_details: JSON.stringify(claim.vehicle_details),
    selected_vehicle: claim.selected_vehicle,
    mva_description: claim.mva_description,
    medical_assistance_type: claim.medical_assistance_type,
    medical_diagnosis: claim.medical_diagnosis,
    medical_treatment: claim.medical_treatment,
    primary_care_provider: claim.primary_care_provider,
    medical_total_cost: claim.medical_total_cost,
    policy_limits: claim.policy_limits,
    assistance_status: claim.assistance_status,
    medical_provider_costs: JSON.stringify(claim.medical_provider_costs),
    repatriation_costs: JSON.stringify(claim.repatriation_costs),
    other_costs: JSON.stringify(claim.other_costs),
    insurance_company: claim.insurance_company,
    claim_reference_number: claim.claim_reference_number,
    adjuster_name: claim.adjuster_name,
    adjuster_contact_details: claim.adjuster_contact_details,
    owner_business_name: claim.owner_business_name,
    owner_reference_number: claim.owner_reference_number,
    owner_phone_number: claim.owner_phone_number,
    co_insured_name: claim.co_insured_name,
    other_party_info: claim.other_party_info,
    law_firm_name: claim.law_firm_name,
    attorney_name: claim.attorney_name,
    attorney_phone: claim.attorney_phone,
    slip_description: claim.slip_description,
    slip_accident_type: claim.slip_accident_type,
    negligence_description: claim.negligence_description,
    witness_name: claim.witness_name,
    witness_email: claim.witness_email,
    witness_phone: claim.witness_phone,
    file_uploads: JSON.stringify(claim.file_uploads),
    additional_notes: claim.additional_notes,
    created_at: claim.created_at,
    updated_at: claim.updated_at,
    username: claim.username,
    user_email: claim.user_email,
  };
}

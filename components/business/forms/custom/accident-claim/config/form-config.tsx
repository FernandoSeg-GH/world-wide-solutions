// formConfig.ts
import { FaUser, FaCarSide, FaBriefcaseMedical, FaFileAlt, FaBalanceScale } from "react-icons/fa";

import { countryOptions } from "./country-options";
import { accidentTypeOptions } from "./accident-options";
import { AccidentClaimFormData, Claim } from "./types";
import { usaStates } from "./state-options";


export interface FieldConfig {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // For select fields
  nestedSection?: string; // For nested objects
  multiple?: boolean; // For file uploads
}

export interface SectionConfig {
  title: string;
  icon: JSX.Element;
  fields: FieldConfig[];
}

export const formSections: SectionConfig[] = [
  {
    title: "Patient Personal Information",
    icon: <FaUser />,
    fields: [
      { id: "full_name", label: "Full Name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "country", label: "Country", type: "select", required: true, options: countryOptions },
      { id: "state", label: "State", type: "conditionalSelect", required: true, options: usaStates }, // Use a list of options if needed for USA states
      { id: "primary_contact", label: "Primary Contact Phone Number", type: "text", required: true },
      { id: "other_contact_name", label: "Relative or Friend", type: "text", required: false },
      { id: "other_contact_phone", label: "Other Contact Phone Number", type: "text", required: false },
    ],
  },
  {
    title: "Accident Information",
    icon: <FaCarSide />,
    fields: [
      { id: "accident_date", label: "Accident Date", type: "date", required: true },
      { id: "accident_place", label: "Accident Place", type: "text", required: true },
      { id: "accident_type", label: "Accident Type", type: "select", required: true, options: accidentTypeOptions },
      { id: "sub_accident_type", label: "Sub Accident Type", type: "text" },
    ],
  },
  {
    title: "Motor Vehicle Accident Details",
    icon: <FaCarSide />,
    fields: [
      {
        id: "mva_type",
        label: "Type of Motor Vehicle",
        type: "select",
        options: [
          { value: "sedan", label: "Sedan" },
          { value: "suv", label: "SUV" },
          { value: "truck", label: "Truck" },
          { value: "motorcycle", label: "Motorcycle" },
          { value: "other", label: "Other" },
        ],
      },
      { id: "mva_location", label: "Location of Accident", type: "text" },
      { id: "vehicle_details", label: "Vehicle Details", type: "vehicleDetails" },
      {
        id: "selected_vehicle",
        label: "Selected Vehicle",
        type: "select",
        options: [
          { value: "vehicle1", label: "Vehicle 1" },
          { value: "vehicle2", label: "Vehicle 2" },
          { value: "vehicle3", label: "Vehicle 3" },
        ],
      },
      { id: "mva_description", label: "Description of Accident", type: "textarea" },

      // Medical Info - Nested Fields
      { id: "mva_medical_info.assistanceType", label: "Assistance Type", type: "text" },
      { id: "mva_medical_info.diagnosis", label: "Diagnosis", type: "text" },
      { id: "mva_medical_info.treatment", label: "Treatment", type: "text" },
      { id: "mva_medical_info.primaryCareProvider", label: "Primary Care Provider", type: "text" },

      // Costs - Nested Fields
      { id: "mva_costs.totalCost", label: "Total Cost", type: "number" },
      { id: "mva_costs.policyLimits", label: "Policy Limits", type: "number" },
      {
        id: "mva_costs.assistanceStatus",
        label: "Assistance Status",
        type: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "under_review", label: "Under Review" },
          { value: "approved", label: "Approved" },
          { value: "closed", label: "Closed" },
        ],
      },
      { id: "mva_costs.medicalProviderCosts", label: "Medical Provider Costs", type: "number" },
      { id: "mva_costs.repatriationCosts", label: "Repatriation Costs", type: "number" },
      { id: "mva_costs.otherCosts", label: "Other Costs", type: "number" },

      // Third Party Info - Nested Fields
      { id: "mva_third_party_info.insuranceCompany", label: "Insurance Company", type: "text" },
      { id: "mva_third_party_info.claimReferenceNumber", label: "Claim Reference Number", type: "text" },
      { id: "mva_third_party_info.adjusterName", label: "Adjuster Name", type: "text" },
      { id: "mva_third_party_info.adjusterContactDetails", label: "Adjuster Contact Details", type: "textarea" },
      { id: "mva_third_party_info.ownerBusinessName", label: "Owner Business Name", type: "text" },
      { id: "mva_third_party_info.ownerReferenceNumber", label: "Owner Reference Number", type: "text" },
      { id: "mva_third_party_info.ownerPhoneNumber", label: "Owner Phone Number", type: "text" },
      { id: "mva_third_party_info.coInsured", label: "Co-Insured", type: "text" },
      { id: "mva_third_party_info.otherPartyInfo", label: "Other Party Information", type: "textarea" },

      // Attorney Info - Nested Fields
      { id: "mva_attorney_info.lawFirmName", label: "Law Firm Name", type: "text" },
      { id: "mva_attorney_info.attorneyName", label: "Attorney Name", type: "text" },
      { id: "mva_attorney_info.attorneyPhone", label: "Attorney Phone", type: "text" },
    ],
  },
  {
    title: "Slip and Fall Details",
    icon: <FaBriefcaseMedical />,
    fields: [
      { id: "slip_description", label: "Slip Description", type: "textarea" },
      { id: "slip_accident_type", label: "Slip Accident Type", type: "text" },
      { id: "negligence_description", label: "Negligence Description", type: "textarea" },
      { id: "witness_info.name", label: "Witness Name", type: "text" },
      { id: "witness_info.email", label: "Witness Email", type: "email" },
      { id: "witness_info.phone", label: "Witness Phone", type: "text" },

      // Medical Info - Nested Fields
      { id: "slip_medical_info.assistanceType", label: "Assistance Type", type: "text" },
      { id: "slip_medical_info.diagnosis", label: "Diagnosis", type: "text" },
      { id: "slip_medical_info.treatment", label: "Treatment", type: "text" },
      { id: "slip_medical_info.primaryCareProvider", label: "Primary Care Provider", type: "text" },

      // Costs - Nested Fields
      { id: "slip_costs.totalCost", label: "Total Cost", type: "number" },
      { id: "slip_costs.policyLimits", label: "Policy Limits", type: "number" },
      {
        id: "slip_costs.assistanceStatus",
        label: "Assistance Status",
        type: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "under_review", label: "Under Review" },
          { value: "approved", label: "Approved" },
          { value: "closed", label: "Closed" },
        ],
      },
      { id: "slip_costs.medicalCost", label: "Medical Cost", type: "number" },
      { id: "slip_costs.repatriationCosts", label: "Repatriation Costs", type: "number" },
      { id: "slip_costs.otherCosts", label: "Other Costs", type: "number" },

      // Third Party Info - Nested Fields
      { id: "slip_third_party_info.insuranceCompany", label: "Insurance Company", type: "text" },
      { id: "slip_third_party_info.claimReferenceNumber", label: "Claim Reference Number", type: "text" },
      { id: "slip_third_party_info.adjusterName", label: "Adjuster Name", type: "text" },
      { id: "slip_third_party_info.adjusterContactDetails", label: "Adjuster Contact Details", type: "textarea" },
      { id: "slip_third_party_info.ownerBusinessName", label: "Owner Business Name", type: "text" },
      { id: "slip_third_party_info.ownerReferenceNumber", label: "Owner Reference Number", type: "text" },
      { id: "slip_third_party_info.ownerPhoneNumber", label: "Owner Phone Number", type: "text" },
      { id: "slip_third_party_info.coInsuredName", label: "Co-Insured Name", type: "text" },
      { id: "slip_third_party_info.otherPartyInfo", label: "Other Party Information", type: "textarea" },

      // Attorney Info - Nested Fields
      { id: "slip_attorney_info.lawFirmName", label: "Law Firm Name", type: "text" },
      { id: "slip_attorney_info.attorneyName", label: "Attorney Name", type: "text" },
      { id: "slip_attorney_info.attorneyPhone", label: "Attorney Phone", type: "text" },
    ],
  },
  {
    title: "File Uploads",
    icon: <FaFileAlt />,
    fields: [
      { id: "new_file_uploads", label: "Upload Files", type: "file", multiple: true },
    ],
  },
];

// Updated mapClaimToFormData to handle multiple file categories
export function mapClaimToFormData(claim: Claim, businessId: string): AccidentClaimFormData {
  return {
    business_id: businessId,
    formUrl: claim.formUrl || "", // Ensure a default value if necessary

    // Patient Personal Information
    full_name: claim.full_name || "",
    email: claim.email || "",
    country: claim.country || "",
    state: claim.state || "",
    primary_contact: claim.primary_contact || "",
    other_contact_name: claim.other_contact_name || "",
    other_contact_phone: claim.other_contact_phone || "",

    // Accident Information
    accident_date: claim.accident_date ? claim.accident_date.split("T")[0] : "",
    accident_place: claim.accident_place || "",
    accident_type: claim.accident_type || "",
    sub_accident_type: claim.sub_accident_type || "",

    // Motor Vehicle Accident Details
    mva_type: claim.mva_type || "",
    mva_location: claim.mva_location || "",
    vehicle_details: claim.vehicle_details || [],
    selected_vehicle: claim.selected_vehicle || "",
    mva_description: claim.mva_description || "",

    // Nested Motor Vehicle Medical Info
    mva_medical_info: {
      assistanceType: claim.mva_medical_info?.assistanceType || "",
      diagnosis: claim.mva_medical_info?.diagnosis || "",
      treatment: claim.mva_medical_info?.treatment || "",
      primaryCareProvider: claim.mva_medical_info?.primaryCareProvider || "",
    },
    mva_costs: {
      totalCost: claim.mva_costs?.totalCost || "",
      policyLimits: claim.mva_costs?.policyLimits || "",
      assistanceStatus: claim.mva_costs?.assistanceStatus || "",
      medicalProviderCosts: claim.mva_costs?.medicalProviderCosts || "",
      repatriationCosts: claim.mva_costs?.repatriationCosts || "",
      otherCosts: claim.mva_costs?.otherCosts || "",
    },
    mva_third_party_info: {
      insuranceCompany: claim.mva_third_party_info?.insuranceCompany || "",
      claimReferenceNumber: claim.mva_third_party_info?.claimReferenceNumber || "",
      adjusterName: claim.mva_third_party_info?.adjusterName || "",
      adjusterContactDetails: claim.mva_third_party_info?.adjusterContactDetails || "",
      ownerBusinessName: claim.mva_third_party_info?.ownerBusinessName || "",
      ownerReferenceNumber: claim.mva_third_party_info?.ownerReferenceNumber || "",
      ownerPhoneNumber: claim.mva_third_party_info?.ownerPhoneNumber || "",
      coInsured: claim.mva_third_party_info?.coInsured || "",
      otherPartyInfo: claim.mva_third_party_info?.otherPartyInfo || "",
    },
    mva_attorney_info: {
      lawFirmName: claim.mva_attorney_info?.lawFirmName || "",
      attorneyName: claim.mva_attorney_info?.attorneyName || "",
      attorneyPhone: claim.mva_attorney_info?.attorneyPhone || "",
    },

    // Slip and Fall Details
    slip_description: claim.slip_description || "",
    slip_accident_type: claim.slip_accident_type || "",
    negligence_description: claim.negligence_description || "",
    witness_info: {
      name: claim.witness_info?.name || "",
      email: claim.witness_info?.email || "",
      phone: claim.witness_info?.phone || "",
    },
    slip_medical_info: {
      assistanceType: claim.slip_medical_info?.assistanceType || "",
      diagnosis: claim.slip_medical_info?.diagnosis || "",
      treatment: claim.slip_medical_info?.treatment || "",
      primaryCareProvider: claim.slip_medical_info?.primaryCareProvider || "",
    },
    slip_costs: {
      totalCost: claim.slip_costs?.totalCost || "",
      policyLimits: claim.slip_costs?.policyLimits || "",
      assistanceStatus: claim.slip_costs?.assistanceStatus || "",
      medicalCost: claim.slip_costs?.medicalCost || "",
      repatriationCosts: claim.slip_costs?.repatriationCosts || "",
      otherCosts: claim.slip_costs?.otherCosts || "",
    },
    slip_third_party_info: {
      insuranceCompany: claim.slip_third_party_info?.insuranceCompany || "",
      claimReferenceNumber: claim.slip_third_party_info?.claimReferenceNumber || "",
      adjusterName: claim.slip_third_party_info?.adjusterName || "",
      adjusterContactDetails: claim.slip_third_party_info?.adjusterContactDetails || "",
      ownerBusinessName: claim.slip_third_party_info?.ownerBusinessName || "",
      ownerReferenceNumber: claim.slip_third_party_info?.ownerReferenceNumber || "",
      ownerPhoneNumber: claim.slip_third_party_info?.ownerPhoneNumber || "",
      coInsuredName: claim.slip_third_party_info?.coInsuredName || "",
      otherPartyInfo: claim.slip_third_party_info?.otherPartyInfo || "",
    },
    slip_attorney_info: {
      lawFirmName: claim.slip_attorney_info?.lawFirmName || "",
      attorneyName: claim.slip_attorney_info?.attorneyName || "",
      attorneyPhone: claim.slip_attorney_info?.attorneyPhone || "",
    },

    // File Uploads (categorized structure)
    file_uploads: null,
    new_file_uploads: null,
  };
}

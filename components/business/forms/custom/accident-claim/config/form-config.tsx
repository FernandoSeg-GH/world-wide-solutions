import { FaUser, FaCarSide, FaFileAlt } from "react-icons/fa";

import { countryOptions } from "./country-options";
import { accidentTypeOptions } from "./accident-options";
import { AccidentClaimFormData, Claim } from "./types";
import { usaStates } from "./state-options";
import { RiAlarmWarningFill } from "react-icons/ri";

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
    icon: <RiAlarmWarningFill />,
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

      // Medical Info - Flat Fields
      { id: "medical_assistance_type", label: "Assistance Type", type: "text" },
      { id: "medical_diagnosis", label: "Diagnosis", type: "text" },
      { id: "medical_treatment", label: "Treatment", type: "text" },
      { id: "primary_care_provider", label: "Primary Care Provider", type: "text" },

      // Costs - Flat Fields
      { id: "medical_total_cost", label: "Total Cost", type: "number" },
      { id: "policy_limits", label: "Policy Limits", type: "number" },
      {
        id: "assistance_status",
        label: "Assistance Status",
        type: "select",
        options: [
          { value: "open", label: "Open" },
          { value: "under_review", label: "Under Review" },
          { value: "approved", label: "Approved" },
          { value: "closed", label: "Closed" },
        ],
      },
      { id: "medical_provider_costs", label: "Medical Provider Costs", type: "number" },
      { id: "repatriation_costs", label: "Repatriation Costs", type: "number" },
      { id: "other_costs", label: "Other Costs", type: "number" },

      // Third Party Info - Flat Fields
      { id: "insurance_company", label: "Insurance Company", type: "text" },
      { id: "claim_reference_number", label: "Claim Reference Number", type: "text" },
      { id: "adjuster_name", label: "Adjuster Name", type: "text" },
      { id: "adjuster_contact_details", label: "Adjuster Contact Details", type: "textarea" },
      { id: "owner_business_name", label: "Owner Business Name", type: "text" },
      { id: "owner_reference_number", label: "Owner Reference Number", type: "text" },
      { id: "owner_phone_number", label: "Owner Phone Number", type: "text" },
      { id: "co_insured_name", label: "Co-Insured Name", type: "text" },
      { id: "other_party_info", label: "Other Party Information", type: "textarea" },

      // Attorney Info - Flat Fields
      { id: "law_firm_name", label: "Law Firm Name", type: "text" },
      { id: "attorney_name", label: "Attorney Name", type: "text" },
      { id: "attorney_phone", label: "Attorney Phone", type: "text" },
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





export function mapClaimToFormData(claim: Claim, businessId: string): AccidentClaimFormData {
  return {

    business_id: "",
    formUrl: "",
    full_name: "",
    email: "",
    country: "",
    state: "",
    primary_contact: "",
    other_contact_name: "",
    other_contact_phone: "",
    accident_date: "",
    accident_place: "",
    accident_type: "",
    sub_accident_type: "",
    mva_type: "",
    mva_location: "",
    vehicle_details: [],
    selected_vehicle: "",
    mva_description: "",
    medical_assistance_type: "",
    medical_diagnosis: "",
    medical_treatment: "",
    primary_care_provider: "",
    medical_total_cost: 0,
    policy_limits: 0,
    assistance_status: "",
    medical_provider_costs: {},
    repatriation_costs: {},
    other_costs: {},
    insurance_company: "",
    claim_reference_number: "",
    adjuster_name: "",
    adjuster_contact_details: "",
    owner_business_name: "",
    owner_reference_number: "",
    owner_phone_number: "",
    co_insured_name: "",
    other_party_info: "",
    law_firm_name: "",
    attorney_name: "",
    attorney_phone: "",
    slip_description: "",
    slip_accident_type: "",
    negligence_description: "",
    witness_name: "",
    witness_email: "",
    witness_phone: ""
  };
}

function parseJSONField(field: string | any, fieldName: string = ""): any {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch (error) {
    console.error(`Failed to parse field "${fieldName}":`, error);
    return null;
  }
}
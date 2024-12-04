// src/components/business/forms/custom/accident-claim/config/formConfig.ts

import { AccidentClaimFormData } from "./types";

export const initialForm: AccidentClaimFormData = {
  business_id: "",
  formUrl: "",
  status: "",
  claim_id: "",
  // Personal Information
  full_name: "",
  email: "",
  country: "",
  state: "",
  primary_contact: "",
  other_contact_name: "",
  other_contact_phone: "",

  // Accident Information
  accident_date: "", // Should be ISO Date string
  accident_place: "",
  accident_type: "",
  sub_accident_type: "",

  // Motor Vehicle Accident Details
  mva_type: "",
  mva_location: "",
  vehicle_details: [],
  selected_vehicle: "",
  mva_description: "",

  // Medical Information (Flat Fields)
  medical_assistance_type: "",
  medical_diagnosis: "",
  medical_treatment: "",
  primary_care_provider: "",

  // Cost of Assistance
  medical_total_cost: 0, // Initialized as number
  policy_limits: 0, // Initialized as number
  assistance_status: "",
  medical_provider_costs: [], // Initialized as empty object
  repatriation_costs: [], // Initialized as empty object
  other_costs: [], // Initialized as empty object

  // Third Party Information
  insurance_company: "",
  claim_reference_number: "",
  adjuster_name: "",
  adjuster_contact_details: "",
  owner_business_name: "",
  owner_reference_number: "",
  owner_phone_number: "",
  co_insured_name: "",
  other_party_info: "",

  // Attorney Information
  law_firm_name: "",
  attorney_name: "",
  attorney_phone: "",

  // Slip and Fall Accident Details
  slip_description: "",
  slip_accident_type: "",
  negligence_description: "",
  witness_name: "",
  witness_email: "",
  witness_phone: "",

  // File Uploads
  file_uploads: null, // Initially no uploads
  new_file_uploads: null, // Initially no new uploads

  // Additional Notes (if any)
  additional_notes: "",
};

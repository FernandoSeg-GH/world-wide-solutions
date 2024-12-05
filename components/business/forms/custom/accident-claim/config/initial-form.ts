import { AccidentClaimFormData } from "./types";

export const initialForm: AccidentClaimFormData = {
  business_id: "",
  formUrl: "",
  status: "",
  claim_id: "",

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
  vehicle_details: [
    {
      licenseNumber: "",
      year: "",
      model: "",
      insuranceName: "",
      policyNumber: "",
    },
  ],
  selected_vehicle: "",
  mva_description: "",

  medical_assistance_type: "",
  medical_diagnosis: "",
  medical_treatment: "",
  primary_care_provider: "",

  medical_total_cost: 0,
  policy_limits: 0,
  assistance_status: "",
  medical_provider_costs: [],
  repatriation_costs: [],
  other_costs: [],

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
  witness_phone: "",

  file_uploads: null,
  new_file_uploads: null,

  additional_notes: "",
};

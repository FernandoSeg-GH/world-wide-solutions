// src/components/business/forms/custom/accident-claim/types.ts

export interface CostDetail {
  providerName: string;
  amountBilled: string;
  amountPaid: string;
  amountUnpaid: string;
  currency: string;
}

export interface VehicleDetail {
  licenseNumber: string;
  year: string;
  model: string;
  insuranceName: string;
  policyNumber: string;
}

export interface MedicalProviderCosts {
  [provider: string]: number;
}

export interface RepatriationCosts {
  [item: string]: number;
}

export interface OtherCosts {
  [item: string]: number;
}

export interface AccidentClaimFormData {
  business_id: string;
  formUrl: string;
  status: string;

  // Personal Information
  claim_id: string;
  full_name: string;
  email: string;
  country: string;
  state: string;
  primary_contact: string;
  other_contact_name: string;
  other_contact_phone: string;

  // Accident Information
  accident_date: string;

  // ========================
  accident_place: string;
  // ========================
  accident_country: string;
  accident_state: string;
  // ========================
  accident_type: string;
  sub_accident_type: string;

  // Motor Vehicle Accident Details
  mva_type: string;
  mva_location: string;
  vehicle_details: VehicleDetail[];
  selected_vehicle: string;
  mva_description: string;

  // Medical Information (Generic for all accident types)
  medical_assistance_type: string;
  medical_diagnosis: string;
  medical_treatment: string;
  primary_care_provider: string;

  // Cost of Assistance
  medical_total_cost: string;
  policy_limits: number;
  total_cost_currency?: string; // Add this field
  policy_limit_currency?: string;
  assistance_status: string;
  medical_provider_costs: CostDetail[];
  repatriation_costs: CostDetail[];
  other_costs: CostDetail[];

  // Third Party Information
  insurance_company: string;
  claim_reference_number: string;
  adjuster_name: string;
  adjuster_contact_details: string;

  // Owner Business Involved (if commercial)
  owner_business_name: string;
  owner_reference_number: string;
  owner_phone_number: string;

  // Co-Insured Information
  co_insured_name: string;
  other_party_info: string;

  // Attorney Information
  law_firm_name: string;
  attorney_name: string;
  attorney_phone: string;

  // Slip and Fall Accident Details
  slip_description: string;
  slip_accident_type: string;
  negligence_description: string;
  witness_name: string;
  witness_email: string;
  witness_phone: string;

  // File Uploads
  file_uploads?: string[] | null; // URLs or identifiers from backend
  new_file_uploads?: File[] | null; // Files to be uploaded

  // Additional Notes (if any)
  additional_notes?: string;
}

export interface Claim extends AccidentClaimFormData {
  user_id: number;
  full_name: string;
  status: string;
  username?: string;
  user_email?: string;
  created_at?: string;
  updated_at?: string;
}

export type VehicleKey = "vehicle1" | "vehicle2" | "vehicle3";

export interface ClaimUserInfo {
  user_id: string;
  username: string;
  user_email: string;
}

export interface EditableClaim extends Claim {
  isEditing: boolean;
  editedData: AccidentClaimFormData;
  user: ClaimUserInfo; // Ensure this matches the backend response
}

export interface GroupedClaims {
  user: ClaimUserInfo;
  claims: EditableClaim[];
}

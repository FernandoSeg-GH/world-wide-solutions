export interface AccidentClaimFormData {
  business_id: string;
  formUrl: string;

  // Patient Personal Information
  full_name: string;
  email: string;
  country: string;
  state: string;
  primary_contact: string;
  other_contact_name: string;
  other_contact_phone: string;

  // Accident Information
  accident_date: string;
  accident_place: string;
  accident_type: string;
  sub_accident_type: string;

  // Motor Vehicle Accident Details
  mva_type: string;
  mva_location: string;
  vehicle_details: Array<{ insuranceName: string; policyNumber: string }>;
  selected_vehicle: string;
  mva_description: string;
  mva_medical_info: {
    assistanceType: string;
    diagnosis: string;
    treatment: string;
    primaryCareProvider: string;
  };
  mva_costs: {
    totalCost: string;
    policyLimits: string;
    assistanceStatus: string;
    medicalProviderCosts: string;
    repatriationCosts: string;
    otherCosts: string;
  };
  mva_third_party_info: {
    insuranceCompany: string;
    claimReferenceNumber: string;
    adjusterName: string;
    adjusterContactDetails: string;
    ownerBusinessName: string;
    ownerReferenceNumber: string;
    ownerPhoneNumber: string;
    coInsured: string;
    otherPartyInfo: string;
  };
  mva_attorney_info: {
    lawFirmName: string;
    attorneyName: string;
    attorneyPhone: string;
  };

  // Slip and Fall Details
  slip_description: string;
  slip_accident_type: string;
  negligence_description: string;
  witness_info: {
    name: string;
    email: string;
    phone: string;
  };
  slip_medical_info: {
    assistanceType: string;
    diagnosis: string;
    treatment: string;
    primaryCareProvider: string;
  };
  slip_costs: {
    totalCost: string;
    policyLimits: string;
    assistanceStatus: string;
    medicalCost: string;
    repatriationCosts: string;
    otherCosts: string;
  };
  slip_third_party_info: {
    insuranceCompany: string;
    claimReferenceNumber: string;
    adjusterName: string;
    adjusterContactDetails: string;
    ownerBusinessName: string;
    ownerReferenceNumber: string;
    ownerPhoneNumber: string;
    coInsuredName: string;
    otherPartyInfo: string;
  };
  slip_attorney_info: {
    lawFirmName: string;
    attorneyName: string;
    attorneyPhone: string;
  };

  // File Uploads
  file_uploads: {
    documentFiles: FileList | null;
    mvaUploadDocumentation: FileList | null;
    mvaRepatriationBills: FileList | null;
    mvaOtherFiles: FileList | null;
    mvaInsuranceDocs: FileList | null;
    mvaBusinessDocs: FileList | null;
    mvaCoInsuredDocs: FileList | null;
    mvaAttorneyDocs: FileList | null;

    slipAccidentReports: FileList | null;
    slipPhotos: FileList | null;
    slipMedicalDocs: FileList | null;
    slipMedicalBills: FileList | null;
    slipRepatriationBills: FileList | null;
    slipThirdPartyDocs: FileList | null;
    slipBusinessDocs: FileList | null;
    slipCoInsuredDocs: FileList | null;

    newDocumentFiles: FileList | null;
    newMvaUploadDocumentation: FileList | null;
    newMvaRepatriationBills: FileList | null;
    newMvaOtherFiles: FileList | null;
    newMvaInsuranceDocs: FileList | null;
    newMvaBusinessDocs: FileList | null;
    newMvaCoInsuredDocs: FileList | null;
    newMvaAttorneyDocs: FileList | null;

    newSlipAccidentReports: FileList | null;
    newSlipPhotos: FileList | null;
    newSlipMedicalDocs: FileList | null;
    newSlipMedicalBills: FileList | null;
    newSlipRepatriationBills: FileList | null;
    newSlipThirdPartyDocs: FileList | null;
    newSlipBusinessDocs: FileList | null;
    newSlipCoInsuredDocs: FileList | null;
  };
}

export type VehicleKey = "vehicle1" | "vehicle2" | "vehicle3";

// types/Claim.ts
export interface VehicleDetail {
  insuranceName: string;
  policyNumber: string;
}

export interface MedicalInfo {
  assistanceType: string;
  diagnosis: string;
  treatment: string;
  primaryCareProvider: string;
}

export interface CostsInfo {
  totalCost: string;
  policyLimits: string;
  assistanceStatus: string;
  medicalProviderCosts: string;
  repatriationCosts: string;
  otherCosts: string;
}

export interface ThirdPartyInfo {
  insuranceCompany: string;
  claimReferenceNumber: string;
  adjusterName: string;
  adjusterContactDetails: string;
  ownerBusinessName: string;
  ownerReferenceNumber: string;
  ownerPhoneNumber: string;
  coInsured: string;
  otherPartyInfo: string;
}

export interface AttorneyInfo {
  lawFirmName: string;
  attorneyName: string;
  attorneyPhone: string;
}

export interface WitnessInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SlipMedicalInfo {
  assistanceType: string;
  diagnosis: string;
  treatment: string;
  primaryCareProvider: string;
}

export interface SlipCostsInfo {
  totalCost: string;
  policyLimits: string;
  assistanceStatus: string;
  medicalCost: string;
  repatriationCosts: string;
  otherCosts: string;
}

export interface SlipThirdPartyInfo {
  insuranceCompany: string;
  claimReferenceNumber: string;
  adjusterName: string;
  adjusterContactDetails: string;
  ownerBusinessName: string;
  ownerReferenceNumber: string;
  ownerPhoneNumber: string;
  coInsuredName: string;
  otherPartyInfo: string;
}

export interface SlipAttorneyInfo {
  lawFirmName: string;
  attorneyName: string;
  attorneyPhone: string;
}

export interface Claim {
  claim_id: string;
  full_name: string;
  email: string;
  country: string;
  state: string;
  primary_contact: string;
  other_contact_name: string;
  other_contact_phone: string;
  accident_date: string; // ISO string
  accident_place: string;
  accident_type: string;
  sub_accident_type: string;
  mva_type: string;
  mva_location: string;
  vehicle_details: VehicleDetail[];
  selected_vehicle: string;
  mva_description: string;
  mva_medical_info: MedicalInfo;
  mva_costs: CostsInfo;
  mva_third_party_info: ThirdPartyInfo;
  mva_attorney_info: AttorneyInfo;
  slip_description: string;
  slip_accident_type: string;
  negligence_description: string;
  witness_info: WitnessInfo;
  slip_medical_info: SlipMedicalInfo;
  slip_costs: SlipCostsInfo;
  slip_third_party_info: SlipThirdPartyInfo;
  slip_attorney_info: SlipAttorneyInfo;
  file_uploads: string[]; // Define more precisely based on backend
  additional_notes?: string;

  documentFiles: string[] | null;
  mvaUploadDocumentation: string[] | null;
  mvaRepatriationBills: string[] | null;
  mvaOtherFiles: string[] | null;
  mvaInsuranceDocs: string[] | null;
  mvaBusinessDocs: string[] | null;
  mvaCoInsuredDocs: string[] | null;
  mvaAttorneyDocs: string[] | null;

  slipAccidentReports: string[] | null;
  slipPhotos: string[] | null;
  slipMedicalDocs: string[] | null;
  slipMedicalBills: string[] | null;
  slipRepatriationBills: string[] | null;
  slipThirdPartyDocs: string[] | null;
  slipBusinessDocs: string[] | null;
  slipCoInsuredDocs: string[] | null;

  formUrl: string;
  created_at: string;
  updated_at: string;
}

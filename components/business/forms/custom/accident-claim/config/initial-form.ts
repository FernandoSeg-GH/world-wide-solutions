import { AccidentClaimFormData } from "./types";

export const initialForm: AccidentClaimFormData = {
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
  vehicle_details: [
    { insuranceName: "", policyNumber: "" },
    { insuranceName: "", policyNumber: "" },
    { insuranceName: "", policyNumber: "" },
  ],
  selected_vehicle: "",
  mva_description: "",

  mva_medical_info: {
    assistanceType: "",
    diagnosis: "",
    treatment: "",
    primaryCareProvider: "",
  },

  mva_costs: {
    totalCost: "",
    policyLimits: "",
    assistanceStatus: "",
    medicalProviderCosts: "",
    repatriationCosts: "",
    otherCosts: "",
  },

  mva_third_party_info: {
    insuranceCompany: "",
    claimReferenceNumber: "",
    adjusterName: "",
    adjusterContactDetails: "",
    ownerBusinessName: "",
    ownerReferenceNumber: "",
    ownerPhoneNumber: "",
    coInsured: "",
    otherPartyInfo: "",
  },

  mva_attorney_info: {
    lawFirmName: "",
    attorneyName: "",
    attorneyPhone: "",
  },

  slip_description: "",
  slip_accident_type: "",
  negligence_description: "",

  witness_info: {
    name: "",
    email: "",
    phone: "",
  },

  slip_medical_info: {
    assistanceType: "",
    diagnosis: "",
    treatment: "",
    primaryCareProvider: "",
  },

  slip_costs: {
    totalCost: "",
    policyLimits: "",
    assistanceStatus: "",
    medicalCost: "",
    repatriationCosts: "",
    otherCosts: "",
  },

  slip_third_party_info: {
    insuranceCompany: "",
    claimReferenceNumber: "",
    adjusterName: "",
    adjusterContactDetails: "",
    ownerBusinessName: "",
    ownerReferenceNumber: "",
    ownerPhoneNumber: "",
    coInsuredName: "",
    otherPartyInfo: "",
  },

  slip_attorney_info: {
    lawFirmName: "",
    attorneyName: "",
    attorneyPhone: "",
  },

  file_uploads: null,
};

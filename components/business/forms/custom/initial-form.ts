// initial-form.ts
import { AccidentClaimFormData } from "./accident-claim-form";

export const initialForm: AccidentClaimFormData = {
  formUrl: "",

  // Patient Personal Information
  full_name: "",
  email: "",
  country: "",
  state: "",
  primary_contact: "",
  other_contact_name: "",
  other_contact_phone: "",

  // Accident Information
  accident_date: null, // Expecting ISO string format when converted
  accident_place: "",
  accident_type: "",
  sub_accident_type: "",

  // Motor Vehicle Accident Details
  mva_type: "",
  mva_location: "",
  vehicle_details: [{ insuranceName: "", policyNumber: "" }], // Array of objects
  selected_vehicle: "",
  mva_description: "",

  // Nested Motor Vehicle Medical Info
  mva_medical_info: {
    assistanceType: "",
    diagnosis: "",
    treatment: "",
    primaryCareProvider: "",
  },

  // Nested Motor Vehicle Costs Info
  mva_costs: {
    totalCost: "",
    policyLimits: "",
    assistanceStatus: "",
    medicalProviderCosts: "",
    repatriationCosts: "",
    otherCosts: "",
  },

  // Nested Motor Vehicle Third Party Info
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

  // Nested Motor Vehicle Attorney Info
  mva_attorney_info: {
    lawFirmName: "",
    attorneyName: "",
    attorneyPhone: "",
  },

  // Slip and Fall Details
  slip_description: "",
  slip_accident_type: "",
  negligence_description: "",

  // Nested Slip Witness Info
  witness_info: {
    name: "",
    email: "",
    phone: "",
  },

  // Nested Slip Medical Info
  slip_medical_info: {
    assistanceType: "",
    diagnosis: "",
    treatment: "",
    primaryCareProvider: "",
  },

  // Nested Slip Costs Info
  slip_costs: {
    totalCost: "",
    policyLimits: "",
    assistanceStatus: "",
    medicalCost: "",
    repatriationCosts: "",
    otherCosts: "",
  },

  // Nested Slip Third Party Info
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

  // Nested Slip Attorney Info
  slip_attorney_info: {
    lawFirmName: "",
    attorneyName: "",
    attorneyPhone: "",
  },

  // File Uploads (null to indicate no files initially)
  documentFiles: null,
  mvaUploadDocumentation: null,
  mvaRepatriationBills: null,
  mvaOtherFiles: null,
  mvaInsuranceDocs: null,
  mvaBusinessDocs: null,
  mvaCoInsuredDocs: null,
  mvaAttorneyDocs: null,

  // Additional Slip-Related File Uploads
  slipAccidentReports: null,
  slipPhotos: null,
  slipMedicalDocs: null,
  slipMedicalBills: null,
  slipRepatriationBills: null,
  slipThirdPartyDocs: null,
  slipBusinessDocs: null,
  slipCoInsuredDocs: null,
};

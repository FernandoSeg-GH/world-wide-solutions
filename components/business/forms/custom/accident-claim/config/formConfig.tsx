// formConfig.ts
import { FaUser, FaCarSide, FaBriefcaseMedical, FaFileAlt, FaBalanceScale } from "react-icons/fa";

import { countryOptions } from "./country-options";
import { accidentTypeOptions } from "./accident-options";
import { AccidentClaimFormData, Claim } from "./types";

export interface FieldConfig {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // For select fields
  nestedSection?: string; // For nested objects
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
      { id: "state", label: "State", type: "conditionalSelect", required: true },
      { id: "primary_contact", label: "Primary Contact Phone Number", type: "text", required: true },
      { id: "other_contact_name", label: "Relative or Friend", type: "text", required: true },
      { id: "other_contact_phone", label: "Other Contact Phone Number", type: "text", required: true },
    ],
  },
  {
    title: "Accident Information",
    icon: <FaCarSide />,
    fields: [
      { id: "accident_date", label: "Accident Date", type: "date", required: true },
      { id: "accident_place", label: "Accident Place", type: "text", required: true },
      { id: "accident_type", label: "Accident Type", type: "select", required: true, options: accidentTypeOptions },
      { id: "sub_accident_type", label: "Sub Accident Type", type: "text" },  // Added this field
    ],
  },
  {
    title: "Motor Vehicle Accident Details",
    icon: <FaCarSide />,
    fields: [
      { id: "mva_type", label: "Type of Motor Vehicle", type: "select", options: [{ value: "sedan", label: "Sedan" }, { value: "suv", label: "SUV" }, { value: "truck", label: "Truck" }] },
      { id: "mva_location", label: "Location of Accident", type: "text" },
      { id: "vehicle_details", label: "Vehicle Details", type: "textarea" },  // Represent array of objects as textarea for simplicity
      { id: "selected_vehicle", label: "Selected Vehicle", type: "select", options: [{ value: "vehicle1", label: "Vehicle 1" }, { value: "vehicle2", label: "Vehicle 2" }, { value: "vehicle3", label: "Vehicle 3" }] },
      { id: "mva_description", label: "Description of Accident", type: "textarea" },

      // Medical Info - Nested Fields
      { id: "mva_medical_info.assistanceType", label: "Assistance Type", type: "text" },
      { id: "mva_medical_info.diagnosis", label: "Diagnosis", type: "text" },
      { id: "mva_medical_info.treatment", label: "Treatment", type: "text" },
      { id: "mva_medical_info.primaryCareProvider", label: "Primary Care Provider", type: "text" },

      // Costs - Nested Fields
      { id: "mva_costs.totalCost", label: "Total Cost", type: "number" },
      { id: "mva_costs.policyLimits", label: "Policy Limits", type: "number" },
      { id: "mva_costs.assistanceStatus", label: "Assistance Status", type: "text" },
      { id: "mva_costs.medicalProviderCosts", label: "Medical Provider Costs", type: "number" },
      { id: "mva_costs.repatriationCosts", label: "Repatriation Costs", type: "number" },
      { id: "mva_costs.otherCosts", label: "Other Costs", type: "number" },

      // Third Party Info - Nested Fields
      { id: "mva_third_party_info.insuranceCompany", label: "Insurance Company", type: "text" },
      { id: "mva_third_party_info.claimReferenceNumber", label: "Claim Reference Number", type: "text" },
      { id: "mva_third_party_info.adjusterName", label: "Adjuster Name", type: "text" },
      { id: "mva_third_party_info.adjusterContactDetails", label: "Adjuster Contact Details", type: "text" },
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
      { id: "negligence_description", label: "Negligence Description", type: "textarea" },  // Added this missing field
      { id: "witness_info.name", label: "Witness Name", type: "text" },
      { id: "witness_info.email", label: "Witness Email", type: "email" },
      { id: "witness_info.phone", label: "Witness Phone", type: "text" },
      { id: "slip_medical_info.assistanceType", label: "Assistance Type", type: "text" },
      { id: "slip_medical_info.diagnosis", label: "Diagnosis", type: "text" },
      { id: "slip_medical_info.treatment", label: "Treatment", type: "text" },
      { id: "slip_medical_info.primaryCareProvider", label: "Primary Care Provider", type: "text" },
      { id: "slip_costs.totalCost", label: "Total Cost", type: "number" },
      { id: "slip_costs.policyLimits", label: "Policy Limits", type: "number" },
      { id: "slip_costs.assistanceStatus", label: "Assistance Status", type: "text" },
      { id: "slip_costs.medicalCost", label: "Medical Cost", type: "number" },
      { id: "slip_costs.repatriationCosts", label: "Repatriation Costs", type: "number" },
      { id: "slip_costs.otherCosts", label: "Other Costs", type: "number" },

      // Third Party Info - Nested Fields
      { id: "slip_third_party_info.insuranceCompany", label: "Insurance Company", type: "text" },
      { id: "slip_third_party_info.claimReferenceNumber", label: "Claim Reference Number", type: "text" },
      { id: "slip_third_party_info.adjusterName", label: "Adjuster Name", type: "text" },
      { id: "slip_third_party_info.adjusterContactDetails", label: "Adjuster Contact Details", type: "text" },
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
      { id: "documentFiles", label: "Document Files", type: "file" },
      { id: "mvaUploadDocumentation", label: "MVA Upload Documentation", type: "file" },
      { id: "mvaRepatriationBills", label: "MVA Repatriation Bills", type: "file" },
      { id: "mvaOtherFiles", label: "MVA Other Files", type: "file" },
      { id: "mvaInsuranceDocs", label: "MVA Insurance Documents", type: "file" },
      { id: "mvaBusinessDocs", label: "MVA Business Documents", type: "file" },
      { id: "mvaCoInsuredDocs", label: "MVA Co-Insured Documents", type: "file" },
      { id: "mvaAttorneyDocs", label: "MVA Attorney Documents", type: "file" },
      { id: "slipAccidentReports", label: "Slip Accident Reports", type: "file" },
      { id: "slipPhotos", label: "Slip Photos", type: "file" },
      { id: "slipMedicalDocs", label: "Slip Medical Documents", type: "file" },
      { id: "slipMedicalBills", label: "Slip Medical Bills", type: "file" },
      { id: "slipRepatriationBills", label: "Slip Repatriation Bills", type: "file" },
      { id: "slipThirdPartyDocs", label: "Slip Third Party Documents", type: "file" },
      { id: "slipBusinessDocs", label: "Slip Business Documents", type: "file" },
      { id: "slipCoInsuredDocs", label: "Slip Co-Insured Documents", type: "file" },
    ],
  },
];


export function mapClaimToFormData(claim: Claim): AccidentClaimFormData {
  return {
    formUrl: "", // Assuming a default value

    // Patient Personal Information
    full_name: claim.full_name || "",
    email: claim.email || "",
    country: claim.country || "",
    state: claim.state || "",
    primary_contact: claim.primary_contact || "",
    other_contact_name: claim.other_contact_name || "",
    other_contact_phone: claim.other_contact_phone || "",

    // Accident Information
    accident_date: claim.accident_date,
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

    // File Uploads (ensure arrays)
    file_uploads: {
      documentFiles: null,
      mvaUploadDocumentation: null,
      mvaRepatriationBills: null,
      mvaOtherFiles: null,
      mvaInsuranceDocs: null,
      mvaBusinessDocs: null,
      mvaCoInsuredDocs: null,
      mvaAttorneyDocs: null,

      slipAccidentReports: null,
      slipPhotos: null,
      slipMedicalDocs: null,
      slipMedicalBills: null,
      slipRepatriationBills: null,
      slipThirdPartyDocs: null,
      slipBusinessDocs: null,
      slipCoInsuredDocs: null,

      newDocumentFiles: null,
      newMvaUploadDocumentation: null,
      newMvaRepatriationBills: null,
      newMvaOtherFiles: null,
      newMvaInsuranceDocs: null,
      newMvaBusinessDocs: null,
      newMvaCoInsuredDocs: null,
      newMvaAttorneyDocs: null,

      newSlipAccidentReports: null,
      newSlipPhotos: null,
      newSlipMedicalDocs: null,
      newSlipMedicalBills: null,
      newSlipRepatriationBills: null,
      newSlipThirdPartyDocs: null,
      newSlipBusinessDocs: null,
      newSlipCoInsuredDocs: null,
    }
  };
}

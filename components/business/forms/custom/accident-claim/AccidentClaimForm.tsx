"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { countryOptions } from "@/components/business/forms/custom/accident-claim/config/country-options";
import ProgressBar from "@/components/ui/progress-bar";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaFileUpload,
    FaDollarSign,
    FaPaperPlane,
    FaUserTie,
    FaUserFriends,
    FaBuilding,
    FaUsers,
    FaHeartbeat,
    FaCarSide,
    FaCar,
    FaWalking,
    FaPlusCircle,
} from "react-icons/fa";
import { usaStates } from "@/components/business/forms/custom/accident-claim/config/state-options";
import { accidentTypeOptions } from "./config/accident-options";
import { AccidentClaimFormData, CostDetail, VehicleDetail } from "./config/types";
import Image from "next/image";
import { initialForm } from "@/components/business/forms/custom/accident-claim/config/initial-form";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import CustomPhoneInput from "@/components/ui/phone-input";
import { Ellipsis, Hospital, PlaneTakeoff, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/ui/file-upload";
import { currencyOptions } from "./config/currencies";

export function formatCurrency(value: string) {
    // Allow only digits, commas, and periods
    const cleanedValue = value.replace(/[^\d.,]/g, '');

    // Allow the user to type commas naturally
    const parts = cleanedValue.split('.');

    // Ensure no more than 2 decimal places
    if (parts.length > 2 || parts[0] === '') return cleanedValue;

    const integerPart = parts[0].replace(/,/g, '');
    const decimalPart = parts[1]?.substring(0, 2);

    // Format integer part with commas
    const formattedInteger = parseInt(integerPart || '0', 10).toLocaleString('en-US');

    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export default function AccidentClaimForm() {
    const [formData, setFormData] = useState<AccidentClaimFormData>(initialForm);
    const { data: session } = useSession();
    const [subAccidentOptions, setSubAccidentOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [isUSA, setIsUSA] = useState<boolean>(false);
    const [isUSAbis, setIsUSAbis] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<boolean>(false);
    const router = useRouter()

    useEffect(() => {
        if (
            formData.country.toLowerCase() === "usa" ||
            formData.country.toLowerCase() === "united_states"
        ) {
            setIsUSA(true);
        } else {
            setIsUSA(false);
        }
    }, [formData.country]);
    useEffect(() => {
        if (
            formData.accident_country.toLowerCase() === "usa" ||
            formData.accident_country.toLowerCase() === "united_states"
        ) {
            setIsUSAbis(true);
        } else {
            setIsUSAbis(false);
        }
    }, [formData.accident_country, formData.accident_state]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const keys = name.split(".");
            if (keys.length === 1) {
                return {
                    ...prevData,
                    [name]: value,
                };
            } else if (keys.length === 2) {
                const [section, field] = keys;
                if (section in prevData) {
                    return {
                        ...prevData,
                        [section]: {
                            ...(prevData[section as keyof AccidentClaimFormData] as any),
                            [field]: value,
                        },
                    };
                }
                return prevData;
            }

            return prevData;
        });
    };

    const handlePhoneChange = (field: keyof AccidentClaimFormData) => (value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const handleAccidentTypeChange = (value: string) => {
        setFormData({ ...formData, accident_type: value, sub_accident_type: "" });
        const selectedType = accidentTypeOptions.find(
            (option) => option.value === value
        );
        setSubAccidentOptions(selectedType?.subOptions || []);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            !formData.accident_date ||
            !formData.accident_country ||
            !formData.accident_state ||
            !formData.full_name
        ) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in all required fields before submitting.",
                variant: "default",
            });
            return;
        }


        if (session?.error) {
            toast({ title: "Session Error", description: "Please sign in again.", variant: "destructive" });
            router.push("/auth/sign-in");
            return;
        }

        if (!session?.accessToken) {
            toast({ title: "Access Denied", description: "You are not authorized to perform this action.", variant: "destructive" });
            return;
        }

        if (!formData.claim_id) {
            toast({ title: "Error - Missing Claim Reference Number.", description: "Claim Reference Number is required.", variant: "default" });
            return;
        }

        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (key === "claim_id") {
                submitData.append(key, value as string);
            } else if (
                key === "medical_provider_costs" ||
                key === "repatriation_costs" ||
                key === "other_costs" ||
                key === "vehicle_details"
            ) {
                submitData.append(key, JSON.stringify(value));
            } else if (typeof value === "object" && value !== null && !(value instanceof FileList)) {
                submitData.append(key, JSON.stringify(value));
            } else if (
                key === 'vehicle_details' ||
                key === 'medical_provider_costs' ||
                key === 'repatriation_costs' ||
                key === 'other_costs'
            ) {
                submitData.append(key, JSON.stringify(value));
            } else if (key === "accident_date") {
                if (value && !isNaN(new Date(value).getTime())) {
                    submitData.append(key, new Date(value).toISOString());
                } else {
                    console.warn(`Invalid accident_date: ${value}`);
                }
            } else if (
                ["slip_description", "slip_accident_type", "negligence_description", "witness_name", "witness_email", "witness_phone"].includes(key)
            ) {
                submitData.append(key, value as string);
            } else {
                submitData.append(key, value as string);
            }
        });

        if (formData.new_file_uploads) {
            formData.new_file_uploads.forEach((file) => {
                submitData.append("new_file_uploads", file);
            });
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/custom/forms/accident-claim/submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                    body: submitData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to submit form:", errorData.error);
                toast({ title: "Error", description: `Failed to submit form: ${errorData.error || "Unknown error"}`, variant: "destructive", });
                return;
            }

            const result = await response.json();

            toast({ title: "Success!", description: "Form submitted successfully!" });
            setFormData(initialForm);
            setSuccessMessage(true)
            router.push("/")
        } catch (error) {
            console.error("An error occurred while submitting the form:", error);
            toast({ title: "Error", description: "An error occurred while submitting the form.", variant: "destructive", });
        }
    };

    const handleAddVehicle = () => {
        setFormData((prevData) => ({
            ...prevData,
            vehicle_details: [
                ...prevData.vehicle_details,
                {
                    licenseNumber: "",
                    year: "",
                    model: "",
                    insuranceName: "",
                    policyNumber: "",
                },
            ],
        }));
    };

    const handleVehicleDetailChange = (
        index: number,
        field: keyof VehicleDetail,
        value: string
    ) => {
        setFormData((prevData) => {
            const updatedVehicles = [...prevData.vehicle_details];
            updatedVehicles[index] = {
                ...updatedVehicles[index],
                [field]: value,
            };
            return { ...prevData, vehicle_details: updatedVehicles };
        });
    };

    const handleRemoveVehicle = (index: number) => {
        setFormData((prevData) => {
            const updatedVehicles = prevData.vehicle_details.filter(
                (_, i) => i !== index
            );
            return { ...prevData, vehicle_details: updatedVehicles };
        });
    };

    const handleAddMedicalCost = () => {
        setFormData((prevData) => ({
            ...prevData,
            medical_provider_costs: [
                ...prevData.medical_provider_costs,
                {
                    providerName: "",
                    amountBilled: "",
                    amountPaid: "",
                    amountUnpaid: "",
                    currency: "USD", // Default currency
                },
            ],
        }));
    };

    const handleAddRepatriationCost = () => {
        setFormData((prevData) => ({
            ...prevData,
            repatriation_costs: [
                ...prevData.repatriation_costs,
                {
                    providerName: "",
                    amountBilled: "",
                    amountPaid: "",
                    amountUnpaid: "",
                    currency: "USD", // Default currency
                },
            ],
        }));
    };

    const handleAddOtherCost = () => {
        setFormData((prevData) => ({
            ...prevData,
            other_costs: [
                ...prevData.other_costs,
                {
                    providerName: "",
                    amountBilled: "",
                    amountPaid: "",
                    amountUnpaid: "",
                    currency: "USD", // Default currency
                },
            ],
        }));
    };

    const handleCostChange = (
        costType: keyof AccidentClaimFormData,
        index: number,
        field: keyof CostDetail,
        value: string | number
    ) => {
        setFormData((prevData) => {
            const updatedCosts = [...(prevData[costType] as CostDetail[])];
            const cost = updatedCosts[index];

            // Update the field value
            (cost[field] as string | number) = value;

            return { ...prevData, [costType]: updatedCosts };
        });
    };

    const handleRemoveCost = (costType: keyof AccidentClaimFormData, index: number) => {
        setFormData((prevData) => {
            const updatedCosts = Array.isArray(prevData[costType])
                ? (prevData[costType] as CostDetail[]).filter((_, i) => i !== index)
                : [];
            return { ...prevData, [costType]: updatedCosts };
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 md:p-16 2xl:p-28">
            {!successMessage ?
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 xl:p-16 overflow-y-auto"
                >
                    {/* Progress Indicator */}
                    {/* <ProgressBar currentStep={1} totalSteps={10} /> */}

                    {/* Title */}
                    <div className="mb-8 flex flex-row items-center justify-between w-full gap-16 text-start">

                        <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                            <FaFileUpload />
                            Accident Claim Report
                        </h1>
                        <Image
                            src="/assets/vws-hor.png"
                            alt="Publicuy Logo"
                            className="h-auto object-contain ml-auto"
                            width={300}
                            height={50}
                        />

                    </div>
                    <p className="text-gray-600 dark:text-gray-400 my-4 mb-6 text- text-justify">
                        This form is intended to be completed with all the details related to the claim assistance. Use it as a guide to provide all the available data in your file or collect the necessary details from the policyholder. You may not have all the information when uploading the claim for the first time, but you can always access your personal dashboard, to edit and add pending information as soon as you receive it.
                    </p>

                    {/* Patient Personal Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUser />
                            Patient Personal Information
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, you must complete with all of your policyholder personal information.
                        </p>
                        <div className="mb-4">
                            <Label htmlFor="claim_id">
                                Claim Reference Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="claim_id"
                                name="claim_id"
                                placeholder="Enter patient claim reference number"
                                value={formData.claim_id}
                                onChange={handleInputChange}
                                className=""
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="full_name">
                                    Patient Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Enter patient first and last name."
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className=""
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"

                                    placeholder="Enter patient email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">
                                    Country of residence
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, country: value })
                                    }
                                    value={formData.country}

                                >
                                    <SelectTrigger
                                        id="country"
                                        className=""
                                    >
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {countryOptions.map((country) => (
                                            <SelectItem className="" key={country.value} value={country.value}>
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                {isUSA ? (
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, state: value })
                                        }
                                        value={formData.state}
                                    >
                                        <SelectTrigger
                                            id="state"
                                            className=""
                                        >
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {usaStates.map((state) => (
                                                <SelectItem className="hover:bg-slate-500" key={state.value} value={state.value}>
                                                    {state.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="state"
                                        name="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className=""
                                    />
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="primary_contact">
                                    Primary Contact Phone Number{" "}
                                </Label>
                                <CustomPhoneInput
                                    id="primary_contact"
                                    value={formData.primary_contact}
                                    onChange={handlePhoneChange("primary_contact")}
                                    className=""
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Other Contact */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaPhone />
                            Other Contact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="other_contact_name">Relative or Friend</Label>
                                <Input
                                    id="other_contact_name"
                                    name="other_contact_name"
                                    placeholder="Name of other contact..."
                                    value={formData.other_contact_name}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div>
                                <Label htmlFor="other_contact_phone">Other Contact Phone Number</Label>

                                <CustomPhoneInput
                                    id="other_contact_phone"
                                    value={formData.other_contact_phone}
                                    onChange={handlePhoneChange("other_contact_phone")}
                                    className=""
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Accident Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaMapMarkerAlt />
                            Accident Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, complete with the most important accident details and select the type of accident that will guide you through specific requirements for that incident.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="">
                                <Label>
                                    Type of Accident
                                </Label>
                                <Select
                                    onValueChange={handleAccidentTypeChange}
                                    value={formData.accident_type}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Choose an option..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accidentTypeOptions.map((option) => (
                                            <SelectItem className="hover:bg-slate-500" key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="accident_date">
                                    Date of Accident <span className="text-red-500">*</span>
                                </Label>
                                <DatePicker
                                    selectedDate={formData.accident_date ? new Date(formData.accident_date) : null}
                                    onChange={(date) =>
                                        setFormData({ ...formData, accident_date: date ? date.toISOString() : "" })
                                    }
                                />
                                {!formData.accident_date && <p className="text-red-500 text-sm">This field is required.</p>}
                            </div>
                            {/* <div>
                                <Label htmlFor="accident_place">
                                    Place of Accident
                                </Label>
                                <Input
                                    id="accident_place"
                                    name="accident_place"
                                    placeholder="Place where the accident occurred"
                                    value={formData.accident_place}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div> */}
                            <div>
                                <Label htmlFor="accident_country">
                                    Country of Accident
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, accident_country: value, accident_state: "" })
                                    }
                                    value={formData.accident_country}
                                >
                                    <SelectTrigger id="accident_country" className="">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {countryOptions.map((country) => (
                                            <SelectItem key={country.value} value={country.value}>
                                                {country.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!formData.accident_country && <p className="text-red-500 text-sm">This field is required.</p>}
                            </div>
                            <div>
                                <Label htmlFor="accident_state">State of Accident</Label>
                                {isUSA ? (
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, accident_state: value })
                                        }
                                        value={formData.accident_state}
                                    >
                                        <SelectTrigger id="accident_state" className="">
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[320px] overflow-y-auto">
                                            {usaStates.map((state) => (
                                                <SelectItem key={state.value} value={state.value}>
                                                    {state.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="accident_state"
                                        name="accident_state"
                                        placeholder="Enter state"
                                        value={formData.accident_state}
                                        onChange={handleInputChange}
                                        className=""
                                    />
                                )}
                                {!formData.accident_state && <p className="text-red-500 text-sm">This field is required.</p>}
                            </div>
                            {/* {formData.accident_type && subAccidentOptions.length > 0 && (
                                <div className="md:col-span-2">
                                    <Label>Specific Accident Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, sub_accident_type: value })
                                        }
                                        value={formData.sub_accident_type}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select specific type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subAccidentOptions.map((option) => (
                                                <SelectItem className="hover:bg-slate-500" key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )} */}
                        </div>
                    </section>

                    {/* Conditional Sections Based on Accident Type */}
                    {formData.accident_type === "motor_vehicle_accidents" && (
                        <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <FaCar />
                                Motor Vehicle Accident Details
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                In this section, provide all vehicle details such as automobile descriptions and insurance certificates.
                            </p>

                            {/* MVA Type and Location */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <Label>Motor Vehicle Accident Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, mva_type: value })
                                        }
                                        value={formData.mva_type}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Choose an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accidentTypeOptions
                                                .find(
                                                    (option) =>
                                                        option.value === "motor_vehicle_accidents"
                                                )
                                                ?.subOptions.map((option) => (
                                                    <SelectItem className="hover:bg-slate-500" key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Where were you located at the time of the accident?</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, mva_location: value })
                                        }
                                        value={formData.mva_location}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem className="hover:bg-slate-500" value="passenger">Passenger</SelectItem>
                                            <SelectItem className="hover:bg-slate-500" value="driver">Driver</SelectItem>
                                            <SelectItem className="hover:bg-slate-500" value="pedestrian">Pedestrian</SelectItem>
                                            <SelectItem className="hover:bg-slate-500" value="bicycle">Bicycle</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Motor Vehicle Information */}
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaCarSide />
                                    Motor Vehicle Information
                                </h3>

                                <div className="flex w-full items-center justify-between">

                                    <p className="text-gray-600 dark:text-gray-400">
                                        In this section, provide the available information for each vehicle involved in the accident.
                                    </p>

                                    <Button
                                        onClick={handleAddVehicle}
                                        className="hover:underline cursor-pointer"
                                        type="button"
                                    >
                                        <PlusCircle className="h-6 w-6 mr-2" />
                                        Add New Vehicle
                                    </Button>
                                </div>


                                <div className="space-y-6 mt-3">
                                    {formData.vehicle_details.map((vehicle, index) => (
                                        <div
                                            key={index}
                                            className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600 mt-6"
                                        >
                                            <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                                Vehicle #{index + 1} Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>License Number</Label>
                                                    <Input
                                                        placeholder="License Number"
                                                        value={vehicle.licenseNumber}
                                                        onChange={(e) =>
                                                            handleVehicleDetailChange(index, 'licenseNumber', e.target.value)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Year of the Vehicle</Label>
                                                    <Input
                                                        placeholder="Year"
                                                        value={vehicle.year}
                                                        onChange={(e) =>
                                                            handleVehicleDetailChange(index, 'year', e.target.value)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Model of the Vehicle</Label>
                                                    <Input
                                                        placeholder="Model"
                                                        value={vehicle.model}
                                                        onChange={(e) =>
                                                            handleVehicleDetailChange(index, 'model', e.target.value)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Insurance Company Name</Label>
                                                    <Input
                                                        placeholder="Insurance Company Name"
                                                        value={vehicle.insuranceName}
                                                        onChange={(e) =>
                                                            handleVehicleDetailChange(index, 'insuranceName', e.target.value)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Policy Number</Label>
                                                    <Input
                                                        placeholder="Policy Number"
                                                        value={vehicle.policyNumber}
                                                        onChange={(e) =>
                                                            handleVehicleDetailChange(index, 'policyNumber', e.target.value)
                                                        }
                                                        className=""
                                                    />
                                                </div>
                                            </div>
                                            {/* Add a button to remove the vehicle */}
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleRemoveVehicle(index)}
                                                className="hover:underline mt-4"
                                                type="button"
                                            >
                                                Remove Vehicle
                                            </Button>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Vehicle Selector */}
                            <div className="mt-8">
                                <Label>
                                    Please select the vehicle that you were in at the time of the accident.
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, selected_vehicle: value })
                                    }
                                    value={formData.selected_vehicle}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select a vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Conditionally add "None" if mva_type is pedestrian accidents */}

                                        {formData.vehicle_details.map((vehicle, index) => (
                                            <SelectItem
                                                key={index}
                                                value={String(index)}
                                                className="hover:bg-slate-500"
                                            >
                                                Vehicle #{index + 1}: {vehicle.model || "Unnamed Vehicle"}
                                            </SelectItem>
                                        ))}
                                        {formData.mva_type === "pedestrian_accidents" && (
                                            <SelectItem key="none" value="none" className="hover:bg-slate-500">
                                                None
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>


                            {/* Documentation & Accident Description */}
                            <div className="mt-8">
                                <Label>
                                    Please write a brief description of the accident.
                                </Label>
                                <Textarea
                                    name="mva_description"
                                    placeholder="Describe the accident..."
                                    rows={5}
                                    value={formData.mva_description}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>

                            <div className="mt-6">
                                <Label>Upload Documentation</Label>
                                <FileUpload
                                    description="Please upload all the documents regarding the motor vehicle accident. Such as police report, rental agreement, certificate of insurance, traffic exchange, pictures from the accident, or any other relevant documents."
                                    multiple
                                    onFilesSelected={(files: File[]) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)], // This converts FileList to File[]
                                        })
                                    }
                                    className=""
                                />
                            </div>
                        </section>
                    )}

                    {formData.accident_type === "slip_and_fall" && (
                        <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <FaWalking />
                                Slip and Fall Accident Details
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                In this section, provide all the details regarding the slip and fall accident.
                            </p>
                            <div className="space-y-6 mt-3">
                                {/* Accident Description */}
                                <div>
                                    <Label>
                                        Slip Description
                                    </Label>
                                    <Textarea
                                        name="slip_description"
                                        placeholder="Please write a brief description of the accident..."
                                        rows={5}
                                        value={formData.slip_description}
                                        onChange={handleInputChange}
                                        className=""
                                    />
                                </div>

                                {/* Accident Type */}
                                <div>
                                    <Label>
                                        Slip Accident Type
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, slip_accident_type: value })
                                        }
                                        value={formData.slip_accident_type}
                                    >
                                        <SelectTrigger className="">
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accidentTypeOptions
                                                .find((option) => option.value === "slip_and_fall")
                                                ?.subOptions.map((option) => (
                                                    <SelectItem className="hover:bg-slate-500" key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Negligence Description */}
                                <div>
                                    <Label>Was there any negligence in the accident?</Label>
                                    <Textarea
                                        name="negligence_description"
                                        placeholder="Explain..."
                                        rows={5}
                                        value={formData.negligence_description}
                                        onChange={handleInputChange}
                                        className=""
                                    />
                                </div>

                                {/* Witness Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <FaUser />
                                        Witness Information
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Was there any witness in the accident?
                                    </p>
                                    <div className="flex flex-col w-full gap-6">

                                        <div className="flex w-full justify-between items-end gap-6">
                                            <div className="w-full">
                                                <Label htmlFor="witness_name">Full Name</Label>
                                                <Input
                                                    id="witness_name"
                                                    name="witness_name"
                                                    placeholder="Enter witness's full name"
                                                    value={formData.witness_name}
                                                    onChange={handleInputChange}
                                                    className=""
                                                />
                                            </div>
                                            <div className="w-full mt-3">
                                                <Label htmlFor="witness_phone">Phone</Label>
                                                <CustomPhoneInput
                                                    id="witness_phone"
                                                    value={formData.witness_phone}
                                                    onChange={handlePhoneChange("witness_phone")}
                                                    className="mt-1 w-full bg-white dark:bg-gray-600 !dark:text-white"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="witness_email">Email</Label>
                                            <Input
                                                id="witness_email"
                                                name="witness_email"
                                                type="email"
                                                placeholder="Enter witness's email"
                                                value={formData.witness_email}
                                                onChange={handleInputChange}
                                                className=""
                                            />
                                        </div>

                                    </div>

                                    <div className="mt-6">
                                        <Label>Upload Slip & Fall Documents</Label>
                                        <FileUpload
                                            description="Please upload all the documents related to the slip and fall accident. Such as police report, internal accident reports, photos of the place of the accident, photos of injuries, and/or any other relevant documents."
                                            multiple
                                            onFilesSelected={(files: File[]) =>
                                                setFormData({
                                                    ...formData,
                                                    new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                                })
                                            }
                                            className=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Medical Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaHeartbeat />
                            Medical Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, complete with all ongoing medical treatments, or future medical needs.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>
                                    Type of Assistance
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, medical_assistance_type: value })
                                    }
                                    value={formData.medical_assistance_type}
                                >
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select type of assistance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Medical Treatment", "Hospitalization", "Surgery", "Physical Therapy", "Psychological Therapy", "Other"].map((option) => (
                                            <SelectItem className="hover:bg-slate-500" key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>
                                    Diagnosis
                                </Label>
                                <Textarea
                                    name="medical_diagnosis"
                                    placeholder="Provide details of the diagnosis..."
                                    rows={4}
                                    value={formData.medical_diagnosis}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>
                                    Treatment
                                </Label>
                                <Textarea
                                    name="medical_treatment"
                                    placeholder="Describe the treatment provided..."
                                    rows={4}
                                    value={formData.medical_treatment}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div className="md:col-span-2 mb-3">
                                <Label>
                                    Primary Care Provider{" "}
                                </Label>
                                <Input
                                    name="primary_care_provider"
                                    placeholder="Name of the clinic or hospital that provided the treatment"
                                    value={formData.primary_care_provider}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Upload Documents</Label>
                            <FileUpload
                                description="Please upload all the documents related to the medical treatment. Such as medical records, discharge notes, emergency notes, or any other medical document."
                                multiple
                                onFilesSelected={(files: File[]) =>
                                    setFormData({
                                        ...formData,
                                        new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                    })
                                }
                                className=""
                            />
                        </div>
                    </section>

                    {/* Cost of Assistance */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaDollarSign />
                            Cost of Assistance
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Fill in all costs received related to the claim, even if they are estimated or exceed the policy limit. <br />Cost are submittied in the standard USD$ currency<i>(e.g. $1,000.00)</i>.
                        </p>

                        {/* Estimated Total Cost */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="relative">
                                <Label>Estimated Total Cost</Label>
                                <div className="flex items-center gap-2">
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, total_cost_currency: value })
                                        }
                                        value={formData.total_cost_currency || "USD"}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue placeholder="Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyOptions.map((currency) => (
                                                <SelectItem key={currency.value} value={currency.value}>
                                                    {currency.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        name="medical_total_cost"
                                        type="text"
                                        placeholder="1,000.00"
                                        value={formData.medical_total_cost || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9.]/g, '');
                                            setFormData({
                                                ...formData,
                                                medical_total_cost: value || '',
                                            });
                                        }}
                                        className="flex-grow bg-white dark:bg-gray-600 !dark:text-white"
                                    />

                                </div>
                            </div>
                        </div>

                        <Separator className="md:col-span-2" />

                        {/* Dynamic Cost Sections */}
                        {[
                            {
                                title: "Medical Provider Bills",
                                icon: <Hospital className="mr-2 h-5 w-5" />,
                                costs: formData.medical_provider_costs,
                                handleAdd: handleAddMedicalCost,
                                handleRemove: handleRemoveCost,
                                costType: "medical_provider_costs",
                            },
                            {
                                title: "Repatriation Bills",
                                icon: <PlaneTakeoff className="mr-2 h-5 w-5" />,
                                costs: formData.repatriation_costs,
                                handleAdd: handleAddRepatriationCost,
                                handleRemove: handleRemoveCost,
                                costType: "repatriation_costs",
                            },
                            {
                                title: "Other Bills",
                                icon: <Ellipsis className="mr-2 h-5 w-5" />,
                                costs: formData.other_costs,
                                handleAdd: handleAddOtherCost,
                                handleRemove: handleRemoveCost,
                                costType: "other_costs",
                            },
                        ].map(({ title, icon, costs, handleAdd, handleRemove, costType }) => (
                            <div key={costType}>
                                <div className="md:col-span-2 my-4 border-b">
                                    <div className="flex justify-between items-start">
                                        <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                            {icon}
                                            {title}
                                        </h3>
                                        <Button onClick={handleAdd} type="button">
                                            <PlusCircle className="mr-2 h-5 w-5" />
                                            Add {title.split(" ")[0]} Bill
                                        </Button>
                                    </div>
                                </div>

                                {costs.map((cost, index) => (
                                    <div key={index} className="border p-4 my-4 rounded mb-4">
                                        <div className="grid grid-cols-1 gap-4">

                                            {/* Name of Provider */}
                                            <div>
                                                <Label>Name of Provider</Label>
                                                <Input
                                                    placeholder="Name of provider"
                                                    value={cost.providerName}
                                                    onChange={(e) =>
                                                        handleCostChange(
                                                            costType as keyof AccidentClaimFormData,
                                                            index,
                                                            "providerName",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            {/* Amount Billed */}
                                            <div>
                                                <Label>Amount Billed <i className="text-xs">(e.g. $1,000.00)</i></Label>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        onValueChange={(value) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "currency",
                                                                value
                                                            )
                                                        }
                                                        value={cost.currency || "USD"}
                                                    >
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="Currency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencyOptions.map((currency) => (
                                                                <SelectItem key={currency.value} value={currency.value}>
                                                                    {currency.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter amount"
                                                        value={cost.amountBilled || ''}
                                                        onChange={(e) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "amountBilled",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Amount Paid */}
                                            <div>
                                                <Label>Amount Paid <i className="text-xs">(e.g. $1,000.00)</i></Label>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        onValueChange={(value) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "currency",
                                                                value
                                                            )
                                                        }
                                                        value={cost.currency || "USD"}
                                                    >
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="Currency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencyOptions.map((currency) => (
                                                                <SelectItem key={currency.value} value={currency.value}>
                                                                    {currency.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter amount"
                                                        value={cost.amountPaid || ''}
                                                        onChange={(e) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "amountPaid",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Amount Unpaid */}
                                            <div>
                                                <Label>Amount Unpaid <i className="text-xs">(e.g. $1,000.00)</i></Label>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        onValueChange={(value) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "currency",
                                                                value
                                                            )
                                                        }
                                                        value={cost.currency || "USD"}
                                                    >
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="Currency" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencyOptions.map((currency) => (
                                                                <SelectItem key={currency.value} value={currency.value}>
                                                                    {currency.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter amount"
                                                        value={cost.amountUnpaid || ''}
                                                        onChange={(e) =>
                                                            handleCostChange(
                                                                costType as keyof AccidentClaimFormData,
                                                                index,
                                                                "amountUnpaid",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            onClick={() =>
                                                handleRemove(costType as keyof AccidentClaimFormData, index)
                                            }
                                            className="mt-4"
                                            type="button"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}

                            </div>
                        ))}
                    </section>


                    <Separator className="md:col-span-2" />

                    {/* File Upload */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">

                        <Separator className="md:col-span-2" />
                        <div className="md:col-span-2">
                            <Label>Upload documentation:</Label>
                            <FileUpload
                                multiple
                                description="Please upload all documents related to the costs of assistance. Such as medical bills, repatriation bills, funeral costs, or any other costs related to the case."
                                onFilesSelected={(files: File[]) =>
                                    setFormData({
                                        ...formData,
                                        new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                    })
                                }
                                className=""
                            />
                        </div>

                    </section>


                    {/* Third Party Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUsers />
                            Third Party Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, completed with all details from any other individual, company, or owner involved, such as an insurance, establishment owner, assistance company or other company on file.
                        </p>
                        <div className="space-y-6">
                            {/* Insurance Company Involved */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaBuilding />
                                    Insurance Company
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>
                                            Insurance Company
                                        </Label>
                                        <Input
                                            name="insurance_company"
                                            placeholder="Enter insurance company name"
                                            value={formData.insurance_company}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Claim Reference Number
                                        </Label>
                                        <Input
                                            name="claim_reference_number"
                                            placeholder=" Enter the claim reference number related to the patient"
                                            value={formData.claim_reference_number}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Adjuster Name
                                        </Label>
                                        <Input
                                            name="adjuster_name"
                                            placeholder="Enter claim adjuster's name"
                                            value={formData.adjuster_name}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Adjuster Contact Details{" "}
                                        </Label>
                                        <Textarea
                                            name="adjuster_contact_details"
                                            placeholder="Email or phone number"
                                            rows={3}
                                            value={formData.adjuster_contact_details}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Label>Insurance Company Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files: File[]) =>
                                            setFormData({
                                                ...formData,
                                                new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                            })
                                        }
                                        className=""
                                    />
                                </div>
                            </div>

                            {/* Owner Business Involved */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaBuilding />
                                    Owner Business Involved (if commercial)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>
                                            Business Name
                                        </Label>
                                        <Input
                                            name="owner_business_name"
                                            placeholder="Enter owner or company name"
                                            value={formData.owner_business_name}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Internal Report Number{" "}
                                        </Label>
                                        <Input
                                            name="owner_reference_number"
                                            placeholder="Enter the internal report number"
                                            value={formData.owner_reference_number}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Phone Number
                                        </Label>
                                        <CustomPhoneInput
                                            value={formData.owner_phone_number}
                                            onChange={handlePhoneChange("owner_phone_number")}
                                            className=""
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Label>Business Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files: File[]) =>
                                            setFormData({
                                                ...formData,
                                                new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                            })
                                        }
                                        className=""
                                    />
                                </div>
                            </div>

                            {/* Co-Insured */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaUserFriends />
                                    Co-Insurer (if any)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Co-Insurer</Label>
                                        <Input
                                            name="co_insured_name"
                                            placeholder="Other Insurance Name"
                                            value={formData.co_insured_name}
                                            onChange={handleInputChange}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        <Label>Upload File</Label>
                                        <FileUpload
                                            description="Upload any insurance certification, membership, or other."
                                            multiple
                                            onFilesSelected={(files: File[]) =>
                                                setFormData({
                                                    ...formData,
                                                    new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                                })
                                            }
                                            className=""
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Other Party Involved */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaUserTie />
                                    Other Party Involved in the Accident
                                </h3>
                                <div>
                                    <Label>
                                        Other Party Info
                                    </Label>
                                    <Textarea
                                        name="other_party_info"
                                        placeholder="Please fill with any other third party details..."
                                        rows={4}
                                        value={formData.other_party_info}
                                        onChange={handleInputChange}
                                        className=""
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Personal Attorney */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUserTie />
                            Personal Attorney
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            In this section, request and complete with any possible legal representation the policyholder may have regarding the accident.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>
                                    Law Firm Name{" "}
                                </Label>
                                <Input
                                    name="law_firm_name"
                                    placeholder="Enter law firm name"
                                    value={formData.law_firm_name}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div>
                                <Label>
                                    Attorney Name{" "}
                                </Label>
                                <Input
                                    name="attorney_name"
                                    placeholder="Enter attorney or paralegal name"
                                    value={formData.attorney_name}
                                    onChange={handleInputChange}
                                    className=""
                                />
                            </div>
                            <div>
                                <Label>
                                    Attorney Phone{" "}
                                </Label>
                                <CustomPhoneInput
                                    value={formData.attorney_phone}
                                    onChange={handlePhoneChange("attorney_phone")}
                                    className=""
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Upload All Documents Regarding the Law Firm:</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files: File[]) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files) as File[]],
                                        })
                                    }
                                    className=""
                                />
                            </div>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="mt-12 flex justify-center">
                        <Button
                            type="submit"
                            className="bg-navyBlue dark:bg-blue-700 text-white px-8 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                        >
                            <FaPaperPlane />
                            Submit
                        </Button>
                    </div>
                </form>
                : <Card className="m-auto shadow text-center">
                    <CardHeader>
                        <CardTitle>Accident Claim Report</CardTitle>
                    </CardHeader>
                    <CardDescription className='px-6 pb-6 flex justify-end'>
                        You have successfully submitted your Accident Claim Report. <br /> You will now be redirected to your dashboard.
                    </CardDescription>
                </Card>
            }
        </div>
    )
}

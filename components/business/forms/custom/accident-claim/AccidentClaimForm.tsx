"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import FileUpload from "@/components/ui/file-upload";
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
} from "react-icons/fa";
import { usaStates } from "@/components/business/forms/custom/accident-claim/config/state-options";
import { accidentTypeOptions } from "./config/accident-options";
import { AccidentClaimFormData } from "./config/types";
import Image from "next/image";
import { initialForm } from "@/components/business/forms/custom/accident-claim/config/initial-form";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";


export default function AccidentClaimForm() {
    const [formData, setFormData] = useState<AccidentClaimFormData>(initialForm);
    const { data: session } = useSession();
    const [subAccidentOptions, setSubAccidentOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [isUSA, setIsUSA] = useState<boolean>(false);
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
                return {
                    ...prevData,
                    [section]: {
                        ...prevData[section],
                        [field]: value,
                    },
                };
            }

            return prevData;
        });
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

        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (
                typeof value === "object" &&
                value !== null &&
                !(value instanceof FileList)
            ) {
                submitData.append(key, JSON.stringify(value));
            } else if (key === "accident_date") {

                submitData.append(key, new Date(value).toISOString());
            } else {
                submitData.append(key, value as string);
            }
        });


        if (formData.new_file_uploads) {
            formData.new_file_uploads.forEach((file) => {
                submitData.append("new_file_uploads", file);
            });
        }


        submitData.append("business_id", formData.business_id || "default");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FLASK_BACKEND_URL}/forms/accident-claim/submit`,
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
            router.push("/dashboard")
        } catch (error) {
            console.error("An error occurred while submitting the form:", error);
            toast({ title: "Error", description: "An error occurred while submitting the form.", variant: "destructive", });
        }
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
                    <div className="mb-8 flex flex-row items-start justify-between w-full gap-16 text-start">
                        <div className="lg:text-left">
                            <h1 className="text-navyBlue dark:text-white text-3xl leading-7 font-bold underline flex items-center gap-2 justify-center lg:justify-start">
                                <FaFileUpload />
                                Accident Claim Report
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-4">
                                Please complete the form below to report your accident.
                                <br />
                                Ensure all fields are filled out accurately.
                            </p>
                        </div>
                        <Image
                            src="/assets/vws-hor.png"
                            alt="Publicuy Logo"
                            className="h-auto object-contain ml-auto"
                            width={300}
                            height={50}
                        />
                    </div>

                    {/* Patient Personal Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUser />
                            Patient Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="full_name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    placeholder="Enter your first and last name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">
                                    Country <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, country: value })
                                    }
                                    value={formData.country}
                                    required
                                >
                                    <SelectTrigger
                                        id="country"
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    >
                                        <SelectValue placeholder="Select your country" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[320px] overflow-y-auto">
                                        {countryOptions.map((country) => (
                                            <SelectItem key={country.value} value={country.value}>
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
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        >
                                            <SelectValue placeholder="Select your state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {usaStates.map((state) => (
                                                <SelectItem key={state.value} value={state.value}>
                                                    {state.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="state"
                                        name="state"
                                        placeholder="Enter your state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="primary_contact">
                                    Primary Contact Phone Number{" "}
                                </Label>
                                <Input
                                    id="primary_contact"
                                    name="primary_contact"
                                    placeholder="+1 234 567 890"
                                    value={formData.primary_contact}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                                    placeholder="Name of your other contact"
                                    value={formData.other_contact_name}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="other_contact_phone">Other Contact Phone Number</Label>
                                <Input
                                    id="other_contact_phone"
                                    name="other_contact_phone"
                                    placeholder="+1 234 567 890"
                                    value={formData.other_contact_phone}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="accident_date">
                                    Date of Accident <span className="text-red-500">*</span>
                                </Label>
                                <DatePicker
                                    selectedDate={new Date(formData.accident_date)}
                                    onChange={(date) =>
                                        setFormData({ ...formData, accident_date: date ? date.toISOString() : "" })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="accident_place">
                                    Place of Accident <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="accident_place"
                                    name="accident_place"
                                    placeholder="Address of the accident"
                                    value={formData.accident_place}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>
                                    Type of Accident <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={handleAccidentTypeChange}
                                    value={formData.accident_type}
                                >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                        <SelectValue placeholder="Choose an option..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accidentTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.accident_type && subAccidentOptions.length > 0 && (
                                <div className="md:col-span-2">
                                    <Label>Specific Accident Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, sub_accident_type: value })
                                        }
                                        value={formData.sub_accident_type}
                                    >
                                        <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                            <SelectValue placeholder="Select specific type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subAccidentOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Upload Documents */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg flex flex-col md:flex-row w-full gap-4">
                        <div className="md:w-1/2">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <FaFileUpload />
                                Upload Your Documents
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Please upload all the documents related to the accident, such as the police report, rental car agreement, certificate of insurance, traffic exchange, pictures from the accident, or any other relevant documents.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <Label>
                                Upload Files <span className="text-red-500">*</span>
                            </Label>
                            <FileUpload
                                multiple
                                onFilesSelected={(files) =>
                                    setFormData({
                                        ...formData,
                                        new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                    })
                                }
                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                            />
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
                                If you had a motor vehicle accident, please complete this section.
                            </p>

                            {/* MVA Type and Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Motor Vehicle Accident Type</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, mva_type: value })
                                        }
                                        value={formData.mva_type}
                                    >
                                        <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                            <SelectValue placeholder="Choose an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accidentTypeOptions
                                                .find(
                                                    (option) =>
                                                        option.value === "motor_vehicle_accidents"
                                                )
                                                ?.subOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Location at the Time of the Accident</Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, mva_location: value })
                                        }
                                        value={formData.mva_location}
                                    >
                                        <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="passenger">Passenger</SelectItem>
                                            <SelectItem value="driver">Driver</SelectItem>
                                            <SelectItem value="pedestrian">Pedestrian</SelectItem>
                                            <SelectItem value="bicycle">Bicycle</SelectItem>
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
                                <div className="space-y-6">
                                    {formData.vehicle_details.map((vehicle, index) => (
                                        <div
                                            key={index}
                                            className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600"
                                        >
                                            <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                                                Vehicle #{index + 1} Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Insurance Name</Label>
                                                    <Input
                                                        placeholder="Insurance Name"
                                                        value={vehicle.insuranceName}
                                                        onChange={(e) =>
                                                            setFormData((prev) => {
                                                                const updatedDetails = [...prev.vehicle_details];
                                                                updatedDetails[index] = {
                                                                    ...updatedDetails[index],
                                                                    insuranceName: e.target.value,
                                                                };
                                                                return { ...prev, vehicle_details: updatedDetails };
                                                            })
                                                        }
                                                        className="mt-1 bg-white dark:bg-gray-700 !dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Policy Number</Label>
                                                    <Input
                                                        placeholder="Policy Number"
                                                        value={vehicle.policyNumber}
                                                        onChange={(e) =>
                                                            setFormData((prev) => {
                                                                const updatedDetails = [...prev.vehicle_details];
                                                                updatedDetails[index] = {
                                                                    ...updatedDetails[index],
                                                                    policyNumber: e.target.value,
                                                                };
                                                                return { ...prev, vehicle_details: updatedDetails };
                                                            })
                                                        }
                                                        className="mt-1 bg-white dark:bg-gray-700 !dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vehicle Selector */}
                            <div className="mt-8">
                                <Label>
                                    Select a Vehicle <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, selected_vehicle: value })
                                    }
                                    value={formData.selected_vehicle}
                                >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                        <SelectValue placeholder="Vehicle #..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vehicle1">Vehicle #1</SelectItem>
                                        <SelectItem value="vehicle2">Vehicle #2</SelectItem>
                                        <SelectItem value="vehicle3">Vehicle #3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Documentation & Accident Description */}
                            <div className="mt-8">
                                <Label>
                                    Accident Description <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    name="mva_description"
                                    placeholder="Describe the accident..."
                                    rows={5}
                                    value={formData.mva_description}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>

                            <div className="mt-6">
                                <Label>Upload Documentation</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [
                                                ...(formData.new_file_uploads || []),
                                                ...Array.from(files),
                                            ],
                                        })
                                    }
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                            <div className="space-y-6">
                                {/* Accident Description */}
                                <div>
                                    <Label>
                                        Slip Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        name="slip_description"
                                        placeholder="Describe the accident..."
                                        rows={5}
                                        value={formData.slip_description}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                </div>

                                {/* Accident Type */}
                                <div>
                                    <Label>
                                        Slip Accident Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, slip_accident_type: value })
                                        }
                                        value={formData.slip_accident_type}
                                    >
                                        <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accidentTypeOptions
                                                .find((option) => option.value === "slip_and_fall")
                                                ?.subOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Negligence Description */}
                                <div>
                                    <Label>Negligence Description</Label>
                                    <Textarea
                                        name="negligence_description"
                                        placeholder="Explain if there was any negligence..."
                                        rows={5}
                                        value={formData.negligence_description}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                </div>

                                {/* Witness Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                        <FaUser />
                                        Witness Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <Label htmlFor="witness_info.name">Full Name</Label>
                                            <Input
                                                id="witness_info.name"
                                                name="witness_info.name"
                                                placeholder="Enter witness's full name"
                                                value={formData.witness_info.name}
                                                onChange={handleInputChange}
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="witness_info.email">Email</Label>
                                            <Input
                                                id="witness_info.email"
                                                name="witness_info.email"
                                                type="email"
                                                placeholder="Enter witness's email"
                                                value={formData.witness_info.email}
                                                onChange={handleInputChange}
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="witness_info.phone">Phone</Label>
                                            <Input
                                                id="witness_info.phone"
                                                name="witness_info.phone"
                                                placeholder="+1 234 567 890"
                                                value={formData.witness_info.phone}
                                                onChange={handleInputChange}
                                                className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                            />
                                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>
                                    Assistance Type

                                </Label>
                                <Textarea
                                    name="mva_medical_info.assistanceType"
                                    placeholder="Describe the type of medical assistance received..."
                                    rows={3}
                                    value={formData.mva_medical_info.assistanceType}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div>
                                <Label>
                                    Diagnosis

                                </Label>
                                <Textarea
                                    name="mva_medical_info.diagnosis"
                                    placeholder="Provide details of the diagnosis..."
                                    rows={4}
                                    value={formData.mva_medical_info.diagnosis}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>
                                    Treatment
                                </Label>
                                <Textarea
                                    name="mva_medical_info.treatment"
                                    placeholder="Describe the treatment received..."
                                    rows={4}
                                    value={formData.mva_medical_info.treatment}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>
                                    Primary Care Provider{" "}


                                </Label>
                                <Input
                                    name="mva_medical_info.primaryCareProvider"
                                    placeholder="Name of your primary care provider"
                                    value={formData.mva_medical_info.primaryCareProvider}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Cost of Assistance */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaDollarSign />
                            Cost of Assistance
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <Label>
                                    Total Cost ($)
                                </Label>
                                <div className="relative mt-1">
                                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        name="mva_costs.totalCost"
                                        type="number"
                                        placeholder="Enter total cost"
                                        value={formData.mva_costs.totalCost}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <Label>
                                    Policy Limits of Assistance Coverage{" "}
                                </Label>
                                <div className="relative mt-1">
                                    <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        name="mva_costs.policyLimits"
                                        type="number"
                                        placeholder="Enter policy limits"
                                        value={formData.mva_costs.policyLimits}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>
                                    Assistance Status{" "}
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            mva_costs: {
                                                ...formData.mva_costs,
                                                assistanceStatus: value,
                                            },
                                        })
                                    }
                                    value={formData.mva_costs.assistanceStatus}
                                >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-600 !dark:text-white">
                                        <SelectValue placeholder="Select status:" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Medical Provider Costs</Label>
                                <Textarea
                                    name="mva_costs.medicalProviderCosts"
                                    placeholder="Details about medical provider costs..."
                                    rows={3}
                                    value={formData.mva_costs.medicalProviderCosts}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Repatriation Costs</Label>
                                <Textarea
                                    name="mva_costs.repatriationCosts"
                                    placeholder="Details about repatriation costs..."
                                    rows={3}
                                    value={formData.mva_costs.repatriationCosts}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Upload Repatriation Bills</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                        })
                                    }
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Other Costs</Label>
                                <Textarea
                                    name="mva_costs.otherCosts"
                                    placeholder="Details about other costs..."
                                    rows={3}
                                    value={formData.mva_costs.otherCosts}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Upload Other Files</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                        })
                                    }
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Third Party Information */}
                    <section className="mb-8 bg-gray-100 dark:bg-gray-700 shadow p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <FaUsers />
                            Third Party Information
                        </h2>
                        <div className="space-y-6">
                            {/* Insurance Company Involved */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaBuilding />
                                    Insurance Company Involved
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>
                                            Insurance Company

                                        </Label>
                                        <Input
                                            name="mva_third_party_info.insuranceCompany"
                                            placeholder="Enter insurance company name"
                                            value={formData.mva_third_party_info.insuranceCompany}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Claim Reference Number

                                        </Label>
                                        <Input
                                            name="mva_third_party_info.claimReferenceNumber"
                                            placeholder="Enter claim reference number"
                                            value={formData.mva_third_party_info.claimReferenceNumber}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Adjuster Name

                                        </Label>
                                        <Input
                                            name="mva_third_party_info.adjusterName"
                                            placeholder="Enter adjuster's name"
                                            value={formData.mva_third_party_info.adjusterName}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Adjuster Contact Details{" "}


                                        </Label>
                                        <Textarea
                                            name="mva_third_party_info.adjusterContactDetails"
                                            placeholder="Email or phone number"
                                            rows={3}
                                            value={formData.mva_third_party_info.adjusterContactDetails}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Label>Insurance Company Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) =>
                                            setFormData({
                                                ...formData,
                                                new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                            })
                                        }
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                                            Owner Business Name

                                        </Label>
                                        <Input
                                            name="mva_third_party_info.ownerBusinessName"
                                            placeholder="Enter owner or company name"
                                            value={formData.mva_third_party_info.ownerBusinessName}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Owner Reference Number{" "}


                                        </Label>
                                        <Input
                                            name="mva_third_party_info.ownerReferenceNumber"
                                            placeholder="Enter reference number"
                                            value={formData.mva_third_party_info.ownerReferenceNumber}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>
                                            Owner Phone Number

                                        </Label>
                                        <Input
                                            name="mva_third_party_info.ownerPhoneNumber"
                                            placeholder="+1 234 567 890"
                                            value={formData.mva_third_party_info.ownerPhoneNumber}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Label>Business Documentation</Label>
                                    <FileUpload
                                        multiple
                                        onFilesSelected={(files) =>
                                            setFormData({
                                                ...formData,
                                                new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                            })
                                        }
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Co-Insured */}
                            <div className="border p-6 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-600">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                    <FaUserFriends />
                                    Co-Insured (if any)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Co-Insured</Label>
                                        <Input
                                            name="mva_third_party_info.coInsured"
                                            placeholder="Enter co-insured name"
                                            value={formData.mva_third_party_info.coInsured}
                                            onChange={handleInputChange}
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label>Upload File</Label>
                                        <FileUpload
                                            multiple
                                            onFilesSelected={(files) =>
                                                setFormData({
                                                    ...formData,
                                                    new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                                })
                                            }
                                            className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                                        name="mva_third_party_info.otherPartyInfo"
                                        placeholder="Provide details about the other party involved..."
                                        rows={4}
                                        value={formData.mva_third_party_info.otherPartyInfo}
                                        onChange={handleInputChange}
                                        className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
                            Personal Attorney representing the patient where the accident or loss occurred.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>
                                    Law Firm Name{" "}
                                </Label>
                                <Input
                                    name="mva_attorney_info.lawFirmName"
                                    placeholder="Enter law firm name"
                                    value={formData.mva_attorney_info.lawFirmName}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div>
                                <Label>
                                    Attorney Name{" "}
                                </Label>
                                <Input
                                    name="mva_attorney_info.attorneyName"
                                    placeholder="Enter attorney or paralegal name"
                                    value={formData.mva_attorney_info.attorneyName}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div>
                                <Label>
                                    Attorney Phone{" "}
                                </Label>
                                <Input
                                    name="mva_attorney_info.attorneyPhone"
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    value={formData.mva_attorney_info.attorneyPhone}
                                    onChange={handleInputChange}
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Attorney Firm Documentation</Label>
                                <FileUpload
                                    multiple
                                    onFilesSelected={(files) =>
                                        setFormData({
                                            ...formData,
                                            new_file_uploads: [...(formData.new_file_uploads || []), ...Array.from(files)],
                                        })
                                    }
                                    className="mt-1 bg-white dark:bg-gray-600 !dark:text-white"
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
    );
}

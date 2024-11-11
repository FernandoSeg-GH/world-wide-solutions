// components/ClaimAccordion.tsx
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { FaChevronUp, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import ClaimDetails from "./ClaimDetails";
import AccidentClaimSection from "./AccidentClaimSection";
import { Button } from "@/components/ui/button";
import { formSections } from "./config/form-config";
import { EditableClaim } from "./AccidentClaimsView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ClaimAccordionProps {
    claim: EditableClaim;
    toggleEdit: (claim_id: string) => void;
    handleFieldChange: (claim_id: string, fieldPath: string, value: any) => void;
    handleSave: (claim_id: string) => void;
    handleCancel: (claim_id: string) => void;
}

const ClaimAccordion: React.FC<ClaimAccordionProps> = ({
    claim,
    toggleEdit,
    handleFieldChange,
    handleSave,
    handleCancel,
}) => {
    return (
        <Disclosure>
            {({ open }) => (
                <div className="border border-gray-300 rounded-lg">
                    {/* Disclosure Button */}
                    <DisclosureButton className={cn("flex justify-between w-full px-4 py-3 text-sm font-medium text-left text-white bg-navyBlue rounded-t-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75", !open && "hover:bg-navyBlue-dark rounded-b-lg ")}>
                        <span>{claim.full_name} - {new Date(claim.created_at).toLocaleDateString()}</span>
                        <FaChevronUp
                            className={`${open ? 'transform rotate-180' : ''
                                } w-5 h-5 text-purple-500`}
                        />
                    </DisclosureButton>

                    {/* Disclosure Panel */}
                    <DisclosurePanel className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700">
                        <Card className="p-0">
                            <CardHeader className="p-0 mb-4">
                                <div className="flex w-full items-center justify-between bg-white dark:bg-gray-800 p-6">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-navyBlue dark:text-white">Accident Claim Report</CardTitle>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">Patient: <strong>{claim.full_name}</strong></p>
                                        <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                                            Submission ID: <span className="font-medium">{claim.claim_id}</span>
                                        </CardDescription>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">Submitted At: {new Date(claim.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <Image
                                        src="https://vinci-space-nest.nyc3.cdn.digitaloceanspaces.com/vinci-space-nest/business_id_2/branding/logo.avif"
                                        width={200}
                                        height={50}
                                        alt="VWSolutions"
                                        className="h-auto object-contain"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {claim.isEditing ? (
                                    <div>
                                        {formSections.map((section) => (
                                            <AccidentClaimSection
                                                key={section.title}
                                                section={section}
                                                data={claim.editedData}
                                                onFieldChange={(fieldId, value) => handleFieldChange(claim.claim_id, fieldId, value)}
                                            />
                                        ))}

                                        {/* Save and Cancel Buttons */}
                                        <div className="flex justify-end mt-6 space-x-2">
                                            <Button
                                                onClick={() => handleCancel(claim.claim_id)}
                                                variant="secondary"
                                                className="flex items-center gap-2"
                                            >
                                                <FaTimes />
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => handleSave(claim.claim_id)}
                                                className="flex items-center gap-2"
                                            >
                                                <FaSave />
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {/* View Mode - Render Claim Details */}
                                        <ClaimDetails
                                            claim={claim}
                                            onEdit={toggleEdit}
                                            handleSave={handleSave}
                                            handleCancel={handleCancel}
                                            handleFieldChange={handleFieldChange}
                                        />
                                        <div className="flex justify-end mt-4">
                                            <Button
                                                onClick={() => toggleEdit(claim.claim_id)}
                                                className="flex items-center gap-2"
                                            >
                                                <FaEdit />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </DisclosurePanel>
                </div>
            )}
        </Disclosure>
    );
};

export default ClaimAccordion;

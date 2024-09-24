"use client";
import { Search } from "@/components/ui/search";
import { GetFormSubmissionByCaseId, getMissingFields } from "@/actions/form"; // New action for missing fields
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LuAlertCircle } from "react-icons/lu";

export default function SearchFormPage() {
    const [submission, setSubmission] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]); // Missing fields state

    const handleSearch = async (caseId: string) => {
        setError("");
        setLoading(true);
        try {
            const result = await GetFormSubmissionByCaseId(caseId);
            if (result) {
                setSubmission(result);
                const missing = await getMissingFields(result); // Get missing fields
                setMissingFields(missing); // Set missing fields in state
            } else {
                setError("No submission found for this Case ID.");
                setMissingFields([]);
            }
        } catch (err) {
            setError("Error retrieving form submission. Please try again.");
            setMissingFields([]);
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-4xl font-bold text-center my-6">Search Form by Case ID</h1>
            <div className="mb-8 flex flex-col items-center">
                <Input
                    className="max-w-md"
                    placeholder="Enter your Internal Case ID Reference Number"
                    onSubmit={(e: any) => {
                        e.preventDefault();
                        handleSearch(e.target.value);
                    }}
                />
                <Button
                    className="mt-4 w-full max-w-md"
                    onClick={() => handleSearch((document.querySelector("input") as HTMLInputElement).value)}
                >
                    Search
                </Button>
            </div>

            {loading && (
                <div className="flex justify-center">
                    <Skeleton className="w-full h-[150px]" />
                </div>
            )}

            {error && (
                <p className="text-red-500 text-center mt-4">{error}</p>
            )}

            {submission && (
                <>
                    <Card className="mt-8 p-4">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Form Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-4">
                            <p className="text-center text-lg mb-6">You have submitted the following information:</p>

                            <div className="grid grid-cols-2 gap-4 text-lg">
                                <div className="font-semibold">First Name:</div>
                                <div>{submission["7184"] || "Not Provided"}</div> {/* First Name Field */}

                                <div className="font-semibold">Last Name:</div>
                                <div>{submission["3968"] || "Not Provided"}</div> {/* Last Name Field */}

                                <div className="font-semibold">Internal Case Id:</div>
                                <div>{submission["4537"] || "Not Provided"}</div> {/* Internal Case ID Field */}

                                <div className="font-semibold">Phone Number:</div>
                                <div>{submission["4124"] || "Not Provided"}</div> {/* Phone Number Field */}

                                <div className="font-semibold">Submitted At:</div>
                                <div>{formatDistanceToNow(new Date(submission.submittedAt))} ago</div> {/* Submission Time */}
                            </div>
                        </CardContent>
                    </Card>

                    {missingFields.length > 0 && (
                        <Card className="mt-6 p-4 border-red-500 border">
                            <div className="flex items-center space-x-3 text-red-600">
                                <LuAlertCircle className="h-6 w-6" />
                                <h2 className="text-xl font-semibold">We have received your form, but some important information is missing</h2>
                            </div>
                            <CardContent className="mt-4 space-y-2">
                                <p>Please provide the following missing information:</p>
                                <ul className="list-disc list-inside">
                                    {missingFields.map((field, index) => (
                                        <li key={index} className="text-red-600">{field}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

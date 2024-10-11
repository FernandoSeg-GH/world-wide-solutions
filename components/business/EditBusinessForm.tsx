// components/EditBusinessForm.tsx

'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/context/AppContext'; // Import the AppContext
import { SubscriptionPlan } from "@/types";

export default function EditBusinessForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, actions } = useAppContext();
    const { business, loading, error, subscriptionPlans } = data;
    const { fetchSubscriptionPlans, getBusinessById, editBusiness, deleteBusiness } = actions;

    const [businessData, setBusinessData] = useState({
        name: "",
        domain: "",
        subscription_plan_id: "",
        description: "",
        phone: "",
        url_linkedin: "",
        url_instagram: "",
        url_facebook: "",
        url_twitter: "",
        url_tiktok: "",
        url_youtube: "",
        seo_description: "",
        business_email: "",
        profile_image_url: "",
        background_image_url: "",
    });

    const businessId = searchParams.get('businessId');

    // Fetch subscription plans and business data on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
        if (businessId) {
            getBusinessById(Number(businessId));
        }
    }, [fetchSubscriptionPlans, getBusinessById, businessId]);

    // Populate form with business data once fetched
    useEffect(() => {
        if (business) {
            setBusinessData({
                name: business.name || "",
                domain: business.domain || "",
                subscription_plan_id: business.subscription_plan_id?.toString() || "",
                description: business.description || "",
                phone: business.phone || "",
                url_linkedin: business.url_linkedin || "",
                url_instagram: business.url_instagram || "",
                url_facebook: business.url_facebook || "",
                url_twitter: business.url_twitter || "",
                url_tiktok: business.url_tiktok || "",
                url_youtube: business.url_youtube || "",
                seo_description: business.seo_description || "",
                business_email: business.business_email || "",
                profile_image_url: business.profile_image_url || "",
                background_image_url: business.background_image_url || "",
            });
        }
    }, [business]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setBusinessData({ ...businessData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId) return;

        const success = await editBusiness(Number(businessId), {
            ...businessData,
            subscription_plan_id: businessData.subscription_plan_id ? Number(businessData.subscription_plan_id) : undefined,
        });

        if (success) {
            router.push("/dashboard");
        }
    };

    const handleDelete = async () => {
        if (!businessId) return;
        const confirmed = confirm("Are you sure you want to delete this business? This action cannot be undone.");
        if (confirmed) {
            const success = await deleteBusiness(Number(businessId));
            if (success) {
                router.push("/dashboard");
            }
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!business) return <p>No business found.</p>;

    return (
        <div className="flex items-start justify-start w-full mb-6">
            <Card className="w-full lg:max-w-md">
                <CardHeader>
                    <CardTitle>Edit Business</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Business Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={businessData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                type="text"
                                value={businessData.domain}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="subscription_plan_id">Subscription Plan</Label>
                            <select
                                id="subscription_plan_id"
                                value={businessData.subscription_plan_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Select a subscription plan</option>
                                {subscriptionPlans.map((plan: SubscriptionPlan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={businessData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={businessData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="business_email">Business Email</Label>
                            <Input
                                id="business_email"
                                type="email"
                                value={businessData.business_email}
                                onChange={handleChange}
                            />
                        </div>
                        {/* Add more fields as necessary */}
                        <div className="flex space-x-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                onClick={handleDelete}
                            >
                                Delete Business
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/context/AppContext'; // Import the AppContext

export default function CreateBusinessForm() {
    const router = useRouter();
    const { data, actions } = useAppContext()
    const subscriptionPlans = data.subscriptionPlans
    const loading = data.loading
    const fetchSubscriptionPlans = actions.fetchSubscriptionPlans
    const createBusiness = actions.createBusiness

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

    // Fetch subscription plans on component mount
    useEffect(() => {
        fetchSubscriptionPlans();
    }, [fetchSubscriptionPlans]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSend = {
            ...businessData,
            subscription_plan_id: Number(businessData.subscription_plan_id),
        };

        const success = await createBusiness(dataToSend);

        if (success) {
            router.push("/dashboard");
        }
    };


    return (
        <div className="flex items-start justify-start w-full">
            <Card className="w-full lg:max-w-md">
                <CardHeader>
                    <CardTitle>Create Business</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Business Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={businessData.name}
                                onChange={(e) =>
                                    setBusinessData({ ...businessData, name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                type="text"
                                value={businessData.domain}
                                onChange={(e) =>
                                    setBusinessData({ ...businessData, domain: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="subscription_plan_id">Subscription Plan</Label>
                            <select
                                id="subscription_plan_id"
                                value={businessData.subscription_plan_id}
                                onChange={(e) =>
                                    setBusinessData({
                                        ...businessData,
                                        subscription_plan_id: e.target.value,
                                    })
                                }
                                required
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Select a subscription plan</option>
                                {subscriptionPlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Business"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

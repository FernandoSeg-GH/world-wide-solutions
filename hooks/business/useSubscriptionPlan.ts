"use client";
import { useState, useCallback } from "react";
import { SubscriptionPlan } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const useSubscriptionPlans = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);

  const fetchSubscriptionPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/business/subscription");
      const data: SubscriptionPlan[] = await res.json();

      if (res.ok) {
        setSubscriptionPlans(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch subscription plans.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching subscription plans.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    subscriptionPlans,
    fetchSubscriptionPlans,
  };
};

"use client";
import { useState, useCallback } from "react";
import { SubscriptionPlan, Business } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export const useBusiness = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  const createBusiness = useCallback(
    async (businessData: any): Promise<boolean> => {
      try {
        setLoading(true);

        const res = await fetch("/api/business", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(businessData),
        });

        const data = await res.json();

        if (res.ok) {
          toast({
            title: "Success",
            description: "Business created successfully.",
          });

          setBusinesses((prev) => [...prev, data]);
          return true;
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to create business.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while creating the business.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  const fetchSubscriptionPlans = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllBusinesses = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await fetch("/api/business", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const data: Business[] = await res.json();
      console.log("data", data);
      if (res.ok) {
        setBusinesses(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch businesses.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching businesses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const getBusinessById = useCallback(
    async (businessId: number): Promise<void> => {
      try {
        setLoading(true);

        const res = await fetch(`/api/business/${businessId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const data: Business = await res.json();

        if (res.ok) {
          setBusiness(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch business.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching the business.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken]
  );

  const editBusiness = useCallback(
    async (
      businessId: number,
      businessData: Partial<Business>
    ): Promise<boolean> => {
      try {
        setLoading(true);

        const res = await fetch(`/api/business/${businessId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(businessData),
        });

        const data = await res.json();

        if (res.ok) {
          toast({
            title: "Success",
            description: "Business updated successfully.",
          });

          setBusinesses((prev) =>
            prev.map((biz) =>
              biz.id === businessId ? { ...biz, ...businessData } : biz
            )
          );
          if (business && business.id === businessId) {
            setBusiness({ ...business, ...businessData });
          }
          return true;
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to update business.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while updating the business.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, business]
  );

  const deleteBusiness = useCallback(
    async (businessId: number): Promise<boolean> => {
      try {
        setLoading(true);

        const res = await fetch(`/api/business/${businessId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (res.ok) {
          toast({
            title: "Success",
            description: "Business deleted successfully.",
          });

          setBusinesses((prevBusinesses) =>
            prevBusinesses.filter((biz) => biz.id !== businessId)
          );
          if (business && business.id === businessId) {
            setBusiness(null);
          }
          return true;
        } else {
          const data = await res.json();
          toast({
            title: "Error",
            description: data.message || "Failed to delete business.",
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while deleting the business.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, business]
  );

  return {
    createBusiness,
    fetchSubscriptionPlans,
    subscriptionPlans,
    getAllBusinesses,
    getBusinessById,
    editBusiness,
    deleteBusiness,
    businesses,
    business,
    loading,
    setLoading,
  };
};

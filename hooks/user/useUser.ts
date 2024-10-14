"use client";

import { toast } from "@/components/ui/use-toast";
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { useSession } from "next-auth/react";

export const useUser = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchAllUsers = useCallback(async () => {
    if (
      !session ||
      !session.accessToken ||
      !session.user?.role?.id ||
      !session.user?.businessId
    )
      return null;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/users?roleId=${session.user.role.id}&businessId=${session.user.businessId}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchCurrentUser = useCallback(async (): Promise<void> => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Failed to fetch user:", errorData);
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch current user.",
          variant: "destructive",
        });
      } else {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching the current user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCurrentUser();
    }
  }, [session?.user?.id, fetchCurrentUser]);

  return {
    users,
    currentUser,
    loading,
    fetchAllUsers,
    setCurrentUser,
  };
};

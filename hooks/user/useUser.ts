// hooks/user/useUser.ts
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

  const fetchAllUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/users", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const fetchCurrentUser = useCallback(async (): Promise<void> => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/auth/users/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch current user.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
    setCurrentUser, // Expose setCurrentUser
  };
};

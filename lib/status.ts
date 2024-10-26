import { useCallback } from "react";

export const statusColor = useCallback((status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-500";
    case "REJECTED":
      return "bg-red-500";
    case "PENDING":
    case "RECEIVED":
      return "bg-gray-500";
    case "REVIEWING":
    case "PROCESSING":
    case "STARTED":
      return "bg-yellow-500";
    default:
      return "bg-gray-300";
  }
}, []);

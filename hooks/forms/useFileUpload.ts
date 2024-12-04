"use client";

import { useState } from "react";

interface UploadResponse {
  message: string;
  filename: string;
  path: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    businessId: string,
    userId: string
  ): Promise<UploadResponse | null> => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", businessId);
    formData.append("userId", userId);

    try {
      const response = await fetch(`/api/forms/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      const data: UploadResponse = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error("Upload Error:", err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    error,
  };
};

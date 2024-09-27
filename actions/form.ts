"use server";

import { Form } from "@/types";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GetFormStats() {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch form stats");
    }

    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error("Error fetching form stats:", error);
    throw new Error("Failed to fetch form stats");
  }
}

export async function CreateForm(data: {
  name: string;
  description: string;
  business_id: number;
}): Promise<{ id: number } | undefined> {
  try {
    const response = await fetch("/api/forms/createform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create form");
    }

    const result = await response.json();
    return result; // should contain the form id
  } catch (error) {
    console.error("Error creating form:", error);
    return undefined;
  }
}

export async function GetForms(businessId: number): Promise<Form[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  const session = await getSession();
  if (!session || !session.accessToken) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(`${API_URL}/forms/${businessId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching forms: ${response.status} ${response.statusText} ${errorText}`
      );
      return [];
    }

    const data = await response.json();
    const forms: Form[] = data.forms;

    return forms;
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw new Error("Failed to fetch forms");
  }
}

export async function GetFormById(id: number) {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const session = await getSession();
    if (!session || !session.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/forms/form/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching form by ID: ${response.status} ${response.statusText} ${errorText}`
      );
      throw new Error(`Failed to fetch form by ID: ${errorText}`);
    }

    const form = await response.json();
    return form;
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    throw new Error("Failed to fetch form by ID");
  }
}

export const UpdateFormContent = async (formId: number, elements: string) => {
  try {
    const response = await fetch(`/api/forms/save-form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        form_id: formId,
        fields: JSON.parse(elements), // Parsing the elements back into JSON format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error saving form");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating form content:", error);
    throw error;
  }
};

export async function PublishForm(id: number) {
  const API_URL =
    process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

  const res = await fetch(`${API_URL}/forms/${id}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JWT_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to publish form");
  }

  return await res.json();
}

export async function SubmitForm(formUrl: string, content: string) {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/submit/${formUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit form");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting form:", error);
    throw new Error("Failed to submit form");
  }
}

export async function GetFormWithSubmissions(id: number) {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${API_URL}/forms/${id}/submissions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching form with submissions: ${response.status} ${response.statusText} ${errorText}`
      );
      throw new Error(`Failed to fetch form with submissions: ${errorText}`);
    }

    const formWithSubmissions = await response.json();
    return formWithSubmissions;
  } catch (error) {
    console.error("Error fetching form with submissions:", error);
    throw new Error("Failed to fetch form with submissions");
  }
}

export async function GetFormSubmissionByCaseId(caseId: string) {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/submission/case/${caseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Submission not found");
    }

    const submission = await response.json();
    return submission;
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw new Error("Error fetching submission");
  }
}

export async function getMissingFields(submission: any) {
  const requiredFields = [
    { id: "7184", label: "First Name" },
    { id: "3968", label: "Last Name" },
    { id: "4537", label: "Internal Case Id" },
    { id: "4124", label: "Phone Number" },
  ];
  // TODO: Dynamic Missing Fields
  const missing = requiredFields.filter((field) => !submission[field.id]);
  return missing.map((field) => field.label);
}

export async function GetFormContentByUrl(formUrl: string) {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/content/${formUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch form content");
    }

    const formContent = await response.json();
    return formContent;
  } catch (error) {
    console.error("Error fetching form content:", error);
    throw new Error("Failed to fetch form content");
  }
}

export async function DeleteForm(id: number): Promise<boolean> {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/form/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error deleting form: ${response.status} ${response.statusText} ${errorText}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting form:", error);
    throw new Error("Failed to delete form");
  }
}

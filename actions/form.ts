"use server";

import { Form } from "@/types";
import prisma from "@/lib/prisma";
import { formSchema, formSchemaType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";

class UserNotFoundErr extends Error {}

export async function GetFormStats() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function GetFormStatsNEW() {
  try {
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

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

// export async function CreateForm(data: formSchemaType) {
//   const validation = formSchema.safeParse(data);
//   if (!validation.success) {
//     throw new Error("form not valid");
//   }

//   const user = await currentUser();
//   if (!user) {
//     throw new UserNotFoundErr();
//   }

//   const { name, description } = data;

//   const form = await prisma.form.create({
//     data: {
//       userId: user.id,
//       name,
//       description,
//     },
//   });

//   if (!form) {
//     throw new Error("something went wrong");
//   }

//   return form.id;
// }

export async function CreateForm(data: {
  name: string;
  description: string;
  fields?: any[];
  business_id: number;
}) {
  try {
    // Check if data is correctly serialized

    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
    const response = await fetch(`${API_URL}/forms/create_form`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify(data), // Make sure this is a properly serialized JSON object
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error creating form:", error);
    throw new Error("Form creation failed");
  }
}

// export async function GetForms() {
//   const user = await currentUser();
//   if (!user) {
//     throw new UserNotFoundErr();
//   }

//   return await prisma.form.findMany({
//     where: {
//       userId: user.id,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// }

// actions/form.ts

export async function GetForms(businessId: number): Promise<Form[]> {
  const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

  try {
    const response = await fetch(`${API_URL}/forms/${businessId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
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

    // Optionally, validate and process forms here

    return forms;
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw new Error("Failed to fetch forms");
  }
}

export async function GetFormById(id: number) {
  try {
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/form/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Error fetching form by ID: ${response.status} ${response.statusText} ${errorText}`
      );
      // throw new Error("Failed to fetch form by ID");
    }

    const form = await response.json();

    if (form.fields && Array.isArray(form.fields)) {
    }
    return form;
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    throw new Error("Failed to fetch form by ID");
  }
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  try {
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/form/${id}`, {
      // Ensure correct URL
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.JWT_TOKEN}`,
      },
      body: JSON.stringify({
        fields: JSON.parse(jsonContent), // Ensure fields are parsed as objects
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update form content`);
    }

    const updatedForm = await response.json();

    return updatedForm;
  } catch (error) {
    console.error("Error updating form content:", error);
    throw new Error("Failed to update form content");
  }
}

// export async function PublishForm(id: number) {
//   const user = await currentUser();
//   if (!user) {
//     throw new UserNotFoundErr();
//   }

//   return await prisma.form.update({
//     data: {
//       published: true,
//     },
//     where: {
//       userId: user.id,
//       id,
//     },
//   });
// }
// actions/form.ts

export async function PublishForm(id: number) {
  const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

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
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

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
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
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
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

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

  // Check which required fields are missing
  const missing = requiredFields.filter((field) => !submission[field.id]);
  return missing.map((field) => field.label);
}

export async function GetFormContentByUrl(formUrl: string) {
  try {
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

    const response = await fetch(`${API_URL}/forms/content/${formUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.JWT_TOKEN}`, // Ensure you are passing the correct token
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
    const API_URL = process.env.FLASK_BACKEND_URL || "http://localhost:5000";

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
      return false; // Indicate failure
    }

    return true; // Indicate success
  } catch (error) {
    console.error("Error deleting form:", error);
    throw new Error("Failed to delete form");
  }
}

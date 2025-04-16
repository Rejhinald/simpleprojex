import { Template } from "@/types/templates";
import Cookie from "js-cookie";

export async function postTemplate(template: Template): Promise<Template> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = Cookie.get("auth-token");
  const formData = new FormData();
  Object.entries(template).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append(key, value);
    } else if (typeof value !== "undefined" && value !== null) {
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value)
      );
    }
  });

  const response = await fetch(`${apiUrl}/api/templates/templates/new/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to create template");
  }

  return response.json();
}

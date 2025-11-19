// src/lib/api.ts

// Backend URL (correct for Next.js)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Get Authorization header
function authHeader() {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Generic GET request
export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Generic POST request
export async function apiPost(path: string, body: any) {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: isFormData
      ? { ...authHeader() } // FormData → browser sets boundary automatically
      : {
          "Content-Type": "application/json",
          ...authHeader(),
        },
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Generic PUT request
export async function apiPut(path: string, body: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Generic DELETE request
export async function apiDelete(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return true;
}

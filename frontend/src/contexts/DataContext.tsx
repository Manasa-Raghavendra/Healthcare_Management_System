// frontend/src/contexts/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [filesByPatient, setFilesByPatient] = useState<Record<number, any[]>>({});

  // -------------------------------------------------------
  // AUTH HEADER
  // -------------------------------------------------------
  function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // -------------------------------------------------------
  // FETCH PATIENTS
  // -------------------------------------------------------
  async function fetchPatients() {
    try {
      const res = await fetch(`${API_URL}/patients`, {
        headers: authHeader(),
      });

      if (!res.ok) return;

      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients", err);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  // -------------------------------------------------------
  // PATIENT CRUD
  // -------------------------------------------------------
  async function addPatient(data: any) {
    const res = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create patient");

    const p = await res.json();
    setPatients((prev) => [p, ...prev]);
    return p;
  }

  async function updatePatient(id: number, data: any) {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update patient");

    const updated = await res.json();
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  }

  async function deletePatient(id: number) {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });

    if (!res.ok) throw new Error("Failed to delete patient");

    setPatients((prev) => prev.filter((p) => p.id !== id));
    return true;
  }

  // -------------------------------------------------------
  // FILE OPERATIONS
  // -------------------------------------------------------

  // 🔄 Refresh files list for a patient
  async function refreshFilesForPatient(patientId: number) {
    try {
      const res = await fetch(`${API_URL}/files/patient/${patientId}`, {
        headers: authHeader(),
      });

      if (!res.ok) return;

      const files = await res.json();
      setFilesByPatient((prev) => ({
        ...prev,
        [patientId]: files,
      }));
    } catch (err) {
      console.error("Error fetching patient files", err);
    }
  }

  // 📤 Upload a report (used inside UploadReports.tsx)
  async function uploadReport(patientId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patient_id", patientId.toString());

    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: {
        ...authHeader(), // token header
        // note: do NOT set Content-Type; browser will set multipart boundary
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      console.error("Upload error:", error);
      throw new Error(JSON.stringify(error));
    }

    // Optionally refresh the files for that patient
    try {
      await refreshFilesForPatient(patientId);
    } catch (_) {}

    return await res.json();
  }

  // -------------------------
  // DOWNLOAD helper (existing)
  // -------------------------
  async function downloadFile(fileId: number, filename: string) {
    const res = await fetch(`${API_URL}/files/${fileId}/download`, {
      method: "GET",
      headers: authHeader(),
    });

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // -------------------------
  // PREVIEW helper (NEW)
  // -------------------------
  /**
   * Fetches the same download endpoint and opens the bytes in a new tab.
   * Works for PDFs & images (browser viewer), other types will typically download.
   */
  async function previewFile(fileId: number, filename?: string) {
    const res = await fetch(`${API_URL}/files/${fileId}/download`, {
      method: "GET",
      headers: authHeader(),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "Preview failed");
      console.error("previewFile failed:", txt);
      throw new Error(txt || "Preview failed");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // open in new tab (popup blockers might prevent this; fallback below)
    const newWin = window.open(url, "_blank");
    if (!newWin) {
      // fallback: create anchor target=_blank and click
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      // don't set download attribute so browser will try to display inline
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // revoke later so browser can load it
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <DataContext.Provider
      value={{
        patients,
        filesByPatient,
        addPatient,
        updatePatient,
        deletePatient,
        refreshFilesForPatient,
        uploadReport,
        downloadFile, // make sure components can call it
        previewFile, // NEW: exposed so ViewReports can call previewFile(...)
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

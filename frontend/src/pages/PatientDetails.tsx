import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function PatientDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patient, setPatient] = useState({
    id: "",
    full_name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    guardian_name: "",
    guardian_phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_history: "",
    allergies: "",
    medications: [{ name: "" }],
    insurance_provider: "",
    insurance_number: "",
  });

  async function loadPatient() {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/patients/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load");

      let data = await res.json();

      if (!Array.isArray(data.medications)) {
        data.medications = [{ name: "" }];
      } else {
        data.medications = data.medications.map((m) =>
          typeof m === "string" ? { name: m } : m
        );
      }

      setPatient((prev) => ({ ...prev, ...data }));
    } catch {
      setError("Unable to load patient.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatient();
  }, [id]);

  function addMedication() {
    setPatient({
      ...patient,
      medications: [...patient.medications, { name: "" }],
    });
  }

  async function handleSave(e: any) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patient),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Patient updated successfully!");
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="p-10 text-center text-xl">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl">Patient Details</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">

            {/* SECTION: Basic Info */}
            <Section title="Basic Information">
              <Grid>
                <FormField label="Full Name">
                  <Input
                    value={patient.full_name}
                    onChange={(e) =>
                      setPatient({ ...patient, full_name: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    value={patient.email}
                    onChange={(e) =>
                      setPatient({ ...patient, email: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Date of Birth">
                  <Input
                    type="date"
                    value={patient.date_of_birth}
                    onChange={(e) =>
                      setPatient({ ...patient, date_of_birth: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Gender">
                  <select
                    className="border rounded-md h-10 px-3"
                    value={patient.gender}
                    onChange={(e) =>
                      setPatient({ ...patient, gender: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </FormField>

                <FormField label="Phone">
                  <Input
                    value={patient.phone}
                    onChange={(e) =>
                      setPatient({ ...patient, phone: e.target.value })
                    }
                  />
                </FormField>
              </Grid>
            </Section>

            {/* SECTION: Guardian */}
            <Section title="Guardian Information">
              <Grid>
                <FormField label="Guardian Name">
                  <Input
                    value={patient.guardian_name}
                    onChange={(e) =>
                      setPatient({ ...patient, guardian_name: e.target.value })
                    }
                  />
                </FormField>

                <FormField label="Guardian Phone">
                  <Input
                    value={patient.guardian_phone}
                    onChange={(e) =>
                      setPatient({ ...patient, guardian_phone: e.target.value })
                    }
                  />
                </FormField>
              </Grid>
            </Section>

            {/* SECTION: Address */}
            <Section title="Address">
              <Textarea
                value={patient.address}
                onChange={(e) =>
                  setPatient({ ...patient, address: e.target.value })
                }
                className="min-h-[90px]"
              />
            </Section>

            {/* SECTION: Emergency Contact */}
            <Section title="Emergency Contact">
              <Grid>
                <FormField label="Contact Name">
                  <Input
                    value={patient.emergency_contact_name}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        emergency_contact_name: e.target.value,
                      })
                    }
                  />
                </FormField>

                <FormField label="Contact Phone">
                  <Input
                    value={patient.emergency_contact_phone}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                  />
                </FormField>
              </Grid>
            </Section>

            {/* SECTION: Medical info */}
            <Section title="Medical Information">
              <FormField label="Medical History">
                <Textarea
                  className="min-h-[90px]"
                  value={patient.medical_history}
                  onChange={(e) =>
                    setPatient({ ...patient, medical_history: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Allergies">
                <Textarea
                  className="min-h-[80px]"
                  value={patient.allergies}
                  onChange={(e) =>
                    setPatient({ ...patient, allergies: e.target.value })
                  }
                />
              </FormField>
            </Section>

            {/* SECTION: Medications */}
            <Section title="Medications">
              {patient.medications.map((med, idx) => (
                <div key={idx} className="flex gap-3 mb-2">
                  <Input
                    placeholder={`Medication #${idx + 1}`}
                    value={med.name}
                    onChange={(e) => {
                      const meds = [...patient.medications];
                      meds[idx].name = e.target.value;
                      setPatient({ ...patient, medications: meds });
                    }}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
              >
                + Add Medication
              </Button>
            </Section>

            {/* SECTION: Insurance */}
            <Section title="Insurance">
              <Grid>
                <FormField label="Provider">
                  <Input
                    value={patient.insurance_provider}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        insurance_provider: e.target.value,
                      })
                    }
                  />
                </FormField>

                <FormField label="Insurance Number">
                  <Input
                    value={patient.insurance_number}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        insurance_number: e.target.value,
                      })
                    }
                  />
                </FormField>
              </Grid>
            </Section>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}






/* ---------- Small UI Helper Components ---------- */

function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function FormField({ label, children }: any) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

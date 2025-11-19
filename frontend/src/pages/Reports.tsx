// frontend/src/pages/Reports.tsx
import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useParams } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export default function ReportsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const { filesByPatient, refreshFilesForPatient, deleteReport } = useData();
  const files = filesByPatient[patientId] || [];

  useEffect(() => {
    if (!isNaN(patientId)) {
      refreshFilesForPatient(patientId);
    }
  }, [patientId]);

  const handleDelete = async (fileId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(fileId, patientId);
      alert("Deleted successfully");
    } catch (err: any) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-semibold">Reports for Patient #{patientId}</h1>

        {files.length === 0 && <p className="text-muted-foreground">No reports found.</p>}

        <div className="space-y-4">
          {files.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle>{f.filename}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Uploaded at: {new Date(f.uploaded_at).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`${API_URL}/files/${f.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(f.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

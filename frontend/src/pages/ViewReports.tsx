import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useData } from "@/contexts/DataContext";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { FileText, Download, Trash2, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ViewReports() {
  const {
    patients,
    filesByPatient,
    refreshFilesForPatient,
    downloadFile,
    previewFile, // <-- used by Preview button
  } = useData();

  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch files when selecting patient
  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      refreshFilesForPatient(Number(selectedPatient))
        .finally(() => setLoading(false));
    }
  }, [selectedPatient]);

  const fileList = selectedPatient
    ? filesByPatient[Number(selectedPatient)] || []
    : [];

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Patient Reports</h1>
        <p className="text-muted-foreground">View or download encrypted reports</p>

        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="animate-spin h-5 w-5" />
                  Loading reports...
                </div>
              ) : fileList.length === 0 ? (
                <p className="text-muted-foreground">No reports found.</p>
              ) : (
                fileList.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between border p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{f.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(f.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => downloadFile(f.id, f.filename)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>

                      {/* PREVIEW button (opens file in new tab when supported) */}
                      <Button
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await previewFile(f.id, f.filename);
                          } catch (err) {
                            console.error("Preview failed", err);
                            toast.error("Preview failed");
                          }
                        }}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>

                      {/* OPTIONAL delete button if you already implemented delete route */}
                      <Button
                        variant="destructive"
                        onClick={() => toast.error("Delete not implemented here")}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

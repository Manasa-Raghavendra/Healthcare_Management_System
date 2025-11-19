import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";

export default function UploadReports() {
  const { patients, uploadReport } = useData();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  async function handleUpload() {
    if (!selectedPatient) return toast.error("Select a patient");
    if (!selectedFile) return toast.error("Select a file");

    try {
      const uploaded = await uploadReport(Number(selectedPatient), selectedFile);

      toast.success(`Uploaded: ${uploaded.filename}`);

      // reset
      setSelectedPatient("");
      setSelectedFile(null);
      (document.getElementById("file-upload") as HTMLInputElement).value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Upload Reports</h1>
        <p className="text-muted-foreground">Upload encrypted medical files</p>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            Files are encrypted with AES-GCM and stored securely.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label>Select Patient</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Choose File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <FileText className="h-4 w-4" /> {selectedFile.name}
                </div>
              )}
            </div>

            <Button onClick={handleUpload} className="w-full gap-2">
              <Upload className="h-4 w-4" /> Upload Report
            </Button>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

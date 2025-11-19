import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function showAge(age?: number | null) {
  return age ? age : "-";
}

export default function Patients() {
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const navigate = useNavigate();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const emptyForm = {
    name: "",
    age: "",
    condition: "",
    gender: "",
    phone: "",
    address: "",
    emergency_contact: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    addPatient({
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
    });

    toast.success("Patient added successfully!");
    setIsAddOpen(false);
    setFormData(emptyForm);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    updatePatient(editingPatient.id, {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
    });

    toast.success("Patient updated successfully!");
    setIsEditOpen(false);
    setEditingPatient(null);
    setFormData(emptyForm);
  };

  const openEditDialog = (p: any) => {
    setEditingPatient(p);
    setFormData({
      name: p.name ?? "",
      age: p.age ?? "",
      condition: p.condition ?? "",
      gender: p.gender ?? "",
      phone: p.phone ?? "",
      address: p.address ?? "",
      emergency_contact: p.emergency_contact ?? "",
      medical_history: p.medical_history ?? "",
      allergies: p.allergies ?? "",
      current_medications: p.current_medications ?? "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete patient "${name}"?`)) {
      deletePatient(id);
      toast.success("Patient deleted.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Patients</h1>
            <p className="text-muted-foreground mt-1">Manage patient records</p>
          </div>

          {/* ADD PATIENT */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Patient
              </Button>
            </DialogTrigger>

            {/* FIXED SCROLL + OVERFLOW */}
            <DialogContent className="max-h-[85vh] overflow-y-auto p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Enter patient information</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4 pb-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Gender</Label>
                    <Input
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      placeholder="Male / Female / Other"
                    />
                  </div>
                </div>

                <div>
                  <Label>Condition</Label>
                  <Input
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Emergency Contact</Label>
                  <Input
                    value={formData.emergency_contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Medical History</Label>
                  <Textarea
                    rows={3}
                    value={formData.medical_history}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medical_history: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Allergies</Label>
                  <Textarea
                    rows={2}
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Current Medications (comma separated)</Label>
                  <Input
                    value={formData.current_medications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_medications: e.target.value,
                      })
                    }
                  />
                </div>

                <Button type="submit" className="w-full">Add Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABLE */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{showAge(p.age)}</TableCell>
                    <TableCell>{p.condition || "-"}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* EDIT PATIENT */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto p-6 rounded-lg">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEdit} className="space-y-4 pb-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <Input
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Condition</Label>
                <Input
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Emergency Contact</Label>
                <Input
                  value={formData.emergency_contact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergency_contact: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Medical History</Label>
                <Textarea
                  value={formData.medical_history}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medical_history: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allergies: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Current Medications (comma separated)</Label>
                <Input
                  value={formData.current_medications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_medications: e.target.value,
                    })
                  }
                />
              </div>

              <Button type="submit" className="w-full">
                Update Patient
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

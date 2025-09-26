"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import type { Patient } from "@/types"
import { PatientForm } from "./pacientes-form"

interface PatientsTableProps {
  patients: Patient[]
  onCreatePatient: (data: Partial<Patient>) => void
  onUpdatePatient: (id: number, data: Partial<Patient>) => void
  onDeletePatient: (id: number) => void
}

export function PatientsTable({ patients, onCreatePatient, onUpdatePatient, onDeletePatient }: PatientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreatePatient = (data: Partial<Patient>) => {
    onCreatePatient(data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdatePatient = (data: Partial<Patient>) => {
    if (selectedPatient) {
      onUpdatePatient(selectedPatient.id, data)
      setIsEditDialogOpen(false)
      setSelectedPatient(null)
    }
  }

  const handleDeletePatient = (patient: Patient) => {
    if (confirm(`¿Está seguro de que desea eliminar al paciente ${patient.name} ${patient.surname}?`)) {
      onDeletePatient(patient.id)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <PatientForm onSubmit={handleCreatePatient} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Seguro</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.name} {patient.surname}
                </TableCell>
                <TableCell>{patient.identifier}</TableCell>
                <TableCell>{patient.phone || "-"}</TableCell>
                <TableCell>{patient.email || "-"}</TableCell>
                <TableCell>
                  {patient.insurance ? <Badge variant="secondary">{patient.insurance}</Badge> : "-"}
                </TableCell>
                <TableCell>{patient.birth_date ? `${calculateAge(patient.birth_date)} años` : "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePatient(patient)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PatientForm
              patient={selectedPatient}
              onSubmit={handleUpdatePatient}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedPatient(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                  <p className="text-sm">
                    {selectedPatient.name} {selectedPatient.surname}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Identificación</Label>
                  <p className="text-sm">{selectedPatient.identifier}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{selectedPatient.phone || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedPatient.email || "No especificado"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Seguro Médico</Label>
                  <p className="text-sm">{selectedPatient.insurance || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                  <p className="text-sm">
                    {selectedPatient.birth_date
                      ? `${formatDate(selectedPatient.birth_date)} (${calculateAge(selectedPatient.birth_date)} años)`
                      : "No especificada"}
                  </p>
                </div>
              </div>
              {selectedPatient.address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                  <p className="text-sm">{selectedPatient.address}</p>
                </div>
              )}
              {selectedPatient.emergency_contact && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contacto de Emergencia</Label>
                  <p className="text-sm">{selectedPatient.emergency_contact}</p>
                </div>
              )}
              {selectedPatient.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notas</Label>
                  <p className="text-sm">{selectedPatient.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

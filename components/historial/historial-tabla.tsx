"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, User, Stethoscope, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { PatientHistory, Patient, Professional } from "@/types"
import { PatientHistoryForm } from "./historial-form"

interface PatientHistoryTableProps {
  history: PatientHistory[]
  patients: Patient[]
  professionals: Professional[]
  onCreateHistory: (data: Partial<PatientHistory>) => void
  onUpdateHistory: (id: number, data: Partial<PatientHistory>) => void
  onDeleteHistory: (id: number) => void
}

export function PatientHistoryTable({
  history,
  patients,
  professionals,
  onCreateHistory,
  onUpdateHistory,
  onDeleteHistory,
}: PatientHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [professionalFilter, setProfessionalFilter] = useState<string>("all")
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Enrich history with patient and professional data
  const enrichedHistory = history.map((record) => ({
    ...record,
    patient: patients.find((p) => p.id === record.patient_id),
    professional: professionals.find((p) => p.id === record.professional_id),
  }))

  const filteredHistory = enrichedHistory.filter((record) => {
    const matchesSearch =
      record.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patient?.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.professional?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.professional?.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPatient = patientFilter === "all" || record.patient_id.toString() === patientFilter
    const matchesProfessional = professionalFilter === "all" || record.professional_id.toString() === professionalFilter

    return matchesSearch && matchesPatient && matchesProfessional
  })

  const handleCreateHistory = (data: Partial<PatientHistory>) => {
    onCreateHistory(data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateHistory = (data: Partial<PatientHistory>) => {
    if (selectedHistory) {
      onUpdateHistory(selectedHistory.id, data)
      setIsEditDialogOpen(false)
      setSelectedHistory(null)
    }
  }

  const handleDeleteHistory = (record: PatientHistory) => {
    const patientName = record.patient ? `${record.patient.name} ${record.patient.surname}` : "Paciente"
    if (confirm(`¿Está seguro de que desea eliminar el registro de historia de ${patientName}?`)) {
      onDeleteHistory(record.id)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar en historias por diagnóstico"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={patientFilter} onValueChange={setPatientFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por paciente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los pacientes</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.name} {patient.surname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por profesional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los profesionales</SelectItem>
              {professionals
                .filter((prof) => prof.is_active)
                .map((professional) => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.name} {professional.surname}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Historia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Historia Clínica</DialogTitle>
            </DialogHeader>
            <PatientHistoryForm
              patients={patients}
              professionals={professionals}
              onSubmit={handleCreateHistory}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Profesional</TableHead>
              <TableHead>Fecha de Visita</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Seguimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory
              .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
              .map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {record.patient?.name} {record.patient?.surname}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.patient?.identifier}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {record.professional?.name} {record.professional?.surname}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.professional?.specialty}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(record.visit_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="truncate max-w-xs" title={record.diagnosis}>
                      {record.diagnosis}
                    </p>
                  </TableCell>
                  <TableCell>
                    {record.follow_up_date ? (
                      <Badge variant="outline">{formatDate(record.follow_up_date)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
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
                            setSelectedHistory(record)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedHistory(record)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteHistory(record)} className="text-destructive">
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
            <DialogTitle>Editar Historia Clínica</DialogTitle>
          </DialogHeader>
          {selectedHistory && (
            <PatientHistoryForm
              history={selectedHistory}
              patients={patients}
              professionals={professionals}
              onSubmit={handleUpdateHistory}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedHistory(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historia Clínica
            </DialogTitle>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Paciente</Label>
                  <p className="text-sm">
                    {selectedHistory.patient?.name} {selectedHistory.patient?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedHistory.patient?.identifier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Profesional</Label>
                  <p className="text-sm">
                    {selectedHistory.professional?.name} {selectedHistory.professional?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedHistory.professional?.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Visita</Label>
                  <p className="text-sm">{formatDate(selectedHistory.visit_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Seguimiento</Label>
                  <p className="text-sm">
                    {selectedHistory.follow_up_date ? formatDate(selectedHistory.follow_up_date) : "No programada"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Diagnóstico</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedHistory.diagnosis}</p>
              </div>

              {selectedHistory.treatment && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tratamiento</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedHistory.treatment}</p>
                </div>
              )}

              {selectedHistory.medications && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Medicamentos</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedHistory.medications}</p>
                </div>
              )}

              {selectedHistory.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notas Clínicas</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedHistory.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

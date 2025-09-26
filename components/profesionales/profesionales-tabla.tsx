"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Clock, Calendar } from "lucide-react"
import type { Professional } from "@/types"
import { ProfessionalForm } from "./profesionales-form"

interface ProfessionalsTableProps {
  professionals: Professional[]
  onCreateProfessional: (data: Partial<Professional>) => void
  onUpdateProfessional: (id: number, data: Partial<Professional>) => void
  onDeleteProfessional: (id: number) => void
}

export function ProfessionalsTable({
  professionals,
  onCreateProfessional,
  onUpdateProfessional,
  onDeleteProfessional,
}: ProfessionalsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredProfessionals = professionals.filter(
    (professional) =>
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.license_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateProfessional = (data: Partial<Professional>) => {
    onCreateProfessional(data)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateProfessional = (data: Partial<Professional>) => {
    if (selectedProfessional) {
      onUpdateProfessional(selectedProfessional.id, data)
      setIsEditDialogOpen(false)
      setSelectedProfessional(null)
    }
  }

  const handleDeleteProfessional = (professional: Professional) => {
    if (confirm(`¿Está seguro de que desea eliminar al profesional ${professional.name} ${professional.surname}?`)) {
      onDeleteProfessional(professional.id)
    }
  }

  const formatWorkingDays = (days: string[]) => {
    const dayNames: Record<string, string> = {
      monday: "L",
      tuesday: "M",
      wednesday: "X",
      thursday: "J",
      friday: "V",
      saturday: "S",
      sunday: "D",
    }
    return days.map((day) => dayNames[day] || day).join(", ")
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds if present
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar profesionales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Profesional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Profesional</DialogTitle>
            </DialogHeader>
            <ProfessionalForm onSubmit={handleCreateProfessional} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Colegiado</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfessionals.map((professional) => (
              <TableRow key={professional.id}>
                <TableCell className="font-medium">
                  {professional.name} {professional.surname}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{professional.specialty}</Badge>
                </TableCell>
                <TableCell>{professional.license_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{formatWorkingDays(professional.working_days)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {formatTime(professional.start_time)} - {formatTime(professional.end_time)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={professional.is_active ? "default" : "secondary"}>
                    {professional.is_active ? "Activo" : "Inactivo"}
                  </Badge>
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
                          setSelectedProfessional(professional)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProfessional(professional)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProfessional(professional)}
                        className="text-destructive"
                      >
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
            <DialogTitle>Editar Profesional</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <ProfessionalForm
              professional={selectedProfessional}
              onSubmit={handleUpdateProfessional}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedProfessional(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Profesional</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                  <p className="text-sm">
                    {selectedProfessional.name} {selectedProfessional.surname}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Especialidad</Label>
                  <p className="text-sm">{selectedProfessional.specialty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Número de Colegiado</Label>
                  <p className="text-sm">{selectedProfessional.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <Badge variant={selectedProfessional.is_active ? "default" : "secondary"}>
                    {selectedProfessional.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{selectedProfessional.phone || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedProfessional.email || "No especificado"}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Días de Trabajo</Label>
                <p className="text-sm">{formatWorkingDays(selectedProfessional.working_days)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Horario</Label>
                  <p className="text-sm">
                    {formatTime(selectedProfessional.start_time)} - {formatTime(selectedProfessional.end_time)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duración de Consulta</Label>
                  <p className="text-sm">{selectedProfessional.consultation_duration} minutos</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

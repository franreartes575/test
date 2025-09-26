"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { PatientHistory, Patient, Professional } from "@/types"

interface PatientHistoryFormProps {
  history?: PatientHistory
  patients: Patient[]
  professionals: Professional[]
  selectedPatientId?: number
  onSubmit: (data: Partial<PatientHistory>) => void
  onCancel: () => void
}

export function PatientHistoryForm({
  history,
  patients,
  professionals,
  selectedPatientId,
  onSubmit,
  onCancel,
}: PatientHistoryFormProps) {
  const [formData, setFormData] = useState({
    patient_id: history?.patient_id || selectedPatientId || 0,
    professional_id: history?.professional_id || 0,
    visit_date: history?.visit_date || "",
    diagnosis: history?.diagnosis || "",
    treatment: history?.treatment || "",
    medications: history?.medications || "",
    notes: history?.notes || "",
    follow_up_date: history?.follow_up_date || "",
  })

  const [visitDate, setVisitDate] = useState<Date | undefined>(
    history?.visit_date ? new Date(history.visit_date) : new Date(),
  )

  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(
    history?.follow_up_date ? new Date(history.follow_up_date) : undefined,
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!visitDate) return

    const historyData = {
      ...formData,
      visit_date: format(visitDate, "yyyy-MM-dd"),
      follow_up_date: followUpDate ? format(followUpDate, "yyyy-MM-dd") : undefined,
      patient_id: Number(formData.patient_id),
      professional_id: Number(formData.professional_id),
    }

    onSubmit(historyData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVisitDateSelect = (date: Date | undefined) => {
    setVisitDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, visit_date: format(date, "yyyy-MM-dd") }))
    }
  }

  const handleFollowUpDateSelect = (date: Date | undefined) => {
    setFollowUpDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, follow_up_date: format(date, "yyyy-MM-dd") }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient_id">Paciente *</Label>
          <Select
            value={formData.patient_id.toString()}
            onValueChange={(value) => handleChange("patient_id", Number(value))}
            disabled={!!selectedPatientId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.name} {patient.surname} - {patient.identifier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="professional_id">Profesional *</Label>
          <Select
            value={formData.professional_id.toString()}
            onValueChange={(value) => handleChange("professional_id", Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar profesional" />
            </SelectTrigger>
            <SelectContent>
              {professionals
                .filter((prof) => prof.is_active)
                .map((professional) => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.name} {professional.surname} - {professional.specialty}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha de Visita *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !visitDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {visitDate ? format(visitDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={visitDate} onSelect={handleVisitDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Fecha de Seguimiento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !followUpDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {followUpDate ? format(followUpDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={followUpDate}
                onSelect={handleFollowUpDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnóstico *</Label>
        <Textarea
          id="diagnosis"
          value={formData.diagnosis}
          onChange={(e) => handleChange("diagnosis", e.target.value)}
          placeholder="Diagnóstico principal y secundarios"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Tratamiento</Label>
        <Textarea
          id="treatment"
          value={formData.treatment}
          onChange={(e) => handleChange("treatment", e.target.value)}
          placeholder="Plan de tratamiento, recomendaciones"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">Medicamentos</Label>
        <Textarea
          id="medications"
          value={formData.medications}
          onChange={(e) => handleChange("medications", e.target.value)}
          placeholder="Medicamentos prescritos, dosis, frecuencia"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Clínicas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Observaciones, síntomas, exámenes realizados"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!formData.patient_id || !formData.professional_id || !visitDate}>
          {history ? "Actualizar" : "Crear"} Historia
        </Button>
      </div>
    </form>
  )
}

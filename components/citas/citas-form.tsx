"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Appointment, Patient, Professional } from "@/types"

interface AppointmentFormProps {
  appointment?: Appointment
  patients: Patient[]
  professionals: Professional[]
  existingAppointments?: Appointment[]
  onSubmit: (data: Partial<Appointment>) => void
  onCancel: () => void
}

export function AppointmentForm({ 
  appointment, 
  patients, 
  professionals, 
  existingAppointments = [],
  onSubmit, 
  onCancel 
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || 0,
    professional_id: appointment?.professional_id || 0,
    appointment_date: appointment?.appointment_date || "",
    appointment_time: appointment?.appointment_time || "",
    duration: appointment?.duration || 30,
    status: appointment?.status || "scheduled",
    priority: appointment?.priority || "normal",
    reason: appointment?.reason || "",
    notes: appointment?.notes || "",
  })

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    appointment?.appointment_date ? new Date(appointment.appointment_date) : undefined,
  )

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [conflictError, setConflictError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    if (formData.professional_id && selectedDate) {
      generateAvailableSlots()
    }
  }, [formData.professional_id, selectedDate])

  useEffect(() => {
    if (formData.professional_id && formData.appointment_time && selectedDate) {
      checkTimeConflict()
    }
  }, [formData.professional_id, formData.appointment_time, selectedDate])

  const generateAvailableSlots = () => {
    const professional = professionals.find((p) => p.id === formData.professional_id)
    if (!professional || !selectedDate) return

    // CORRECCION: Usar "long" en lugar de "lowercase"
    const dayOfWeek = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    
    if (!professional.working_days.includes(dayOfWeek)) {
      setAvailableSlots([])
      return
    }

    const slots: string[] = []
    const startTime = new Date(`2000-01-01T${professional.start_time}:00`)
    const endTime = new Date(`2000-01-01T${professional.end_time}:00`)
    const duration = professional.consultation_duration

    const currentTime = new Date(startTime)
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5)
      
      // Filtrar horarios ya ocupados
      const isOccupied = existingAppointments.some(apt => 
        apt.professional_id === formData.professional_id &&
        apt.appointment_date === format(selectedDate, "yyyy-MM-dd") &&
        apt.appointment_time === timeString &&
        apt.id !== appointment?.id && // Excluir la cita actual si estamos editando
        apt.status !== "cancelled"
      )

      if (!isOccupied) {
        slots.push(timeString)
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + duration)
    }

    setAvailableSlots(slots)
  }

  const checkTimeConflict = () => {
    if (!selectedDate || !formData.appointment_time || !formData.professional_id) {
      setConflictError("")
      return
    }

    const dateString = format(selectedDate, "yyyy-MM-dd")
    const hasConflict = existingAppointments.some(apt => 
      apt.professional_id === formData.professional_id &&
      apt.appointment_date === dateString &&
      apt.appointment_time === formData.appointment_time &&
      apt.id !== appointment?.id &&
      apt.status !== "cancelled"
    )

    if (hasConflict) {
      const professional = professionals.find(p => p.id === formData.professional_id)
      setConflictError(
        `El profesional ${professional?.name} ${professional?.surname} ya tiene una cita programada a las ${formData.appointment_time} el ${format(selectedDate, "dd/MM/yyyy", { locale: es })}`
      )
    } else {
      setConflictError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return
    if (conflictError) return

    const appointmentData = {
      ...formData,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      patient_id: Number(formData.patient_id),
      professional_id: Number(formData.professional_id),
    }

    onSubmit(appointmentData)
    
    // Mostrar mensaje de éxito
    const patient = patients.find(p => p.id === formData.patient_id)
    const professional = professionals.find(p => p.id === formData.professional_id)
    setSuccessMessage(
      `✅ ${appointment ? 'Cita actualizada' : 'Cita creada'} exitosamente para ${patient?.name} ${patient?.surname} con ${professional?.name} ${professional?.surname}`
    )
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, appointment_date: format(date, "yyyy-MM-dd"), appointment_time: "" }))
    }
    setConflictError("")
  }

  const isFormValid = formData.patient_id && formData.professional_id && selectedDate && formData.appointment_time && !conflictError

  return (
    <div className="space-y-4">
      {/* Mensaje de éxito */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Mensaje de error de conflicto */}
      {conflictError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {conflictError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Paciente *</Label>
            <Select
              value={formData.patient_id.toString()}
              onValueChange={(value) => handleChange("patient_id", Number(value))}
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
            <Label>Fecha de la Cita *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_time">Hora *</Label>
            <Select
              value={formData.appointment_time}
              onValueChange={(value) => handleChange("appointment_time", value)}
              disabled={!formData.professional_id || !selectedDate}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !formData.professional_id ? "Seleccionar profesional primero" :
                  !selectedDate ? "Seleccionar fecha primero" :
                  availableSlots.length === 0 ? "No hay horarios disponibles" :
                  "Seleccionar hora"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDate && formData.professional_id && availableSlots.length === 0 && (
              <p className="text-sm text-muted-foreground">
                El profesional no atiende este día o no tiene horarios disponibles
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duración (min)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="120"
              step="15"
              value={formData.duration}
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no_show">No se presentó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motivo de la Consulta</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Revisión, control, síntomas, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Información adicional sobre la cita"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid}
            className={cn(
              isFormValid && "bg-green-600 hover:bg-green-700"
            )}
          >
            {appointment ? "Actualizar" : "Crear"} Cita
          </Button>
        </div>
      </form>
    </div>
  )
}
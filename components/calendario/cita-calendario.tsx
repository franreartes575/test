"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Clock, User, Stethoscope, CalendarIcon } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import type { Appointment, Patient, Professional } from "@/types"

interface AppointmentCalendarProps {
  appointments: Appointment[]
  patients: Patient[]
  professionals: Professional[]
}

export function AppointmentCalendar({ appointments, patients, professionals }: AppointmentCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Filter appointments by selected professional and current week
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = parseISO(appointment.appointment_date)
    const isInWeek = appointmentDate >= weekStart && appointmentDate <= weekEnd
    const matchesProfessional =
      selectedProfessional === "all" || appointment.professional_id.toString() === selectedProfessional

    return isInWeek && matchesProfessional
  })

  // Enrich appointments with patient and professional data
  const enrichedAppointments = filteredAppointments.map((appointment) => ({
    ...appointment,
    patient: patients.find((p) => p.id === appointment.patient_id),
    professional: professionals.find((p) => p.id === appointment.professional_id),
  }))

  const getAppointmentsForDay = (date: Date) => {
    return enrichedAppointments.filter((appointment) => isSameDay(parseISO(appointment.appointment_date), date))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      no_show: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[status as keyof typeof colors] || colors.scheduled
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: "border-l-red-500",
      high: "border-l-orange-500",
      normal: "border-l-blue-500",
      low: "border-l-gray-500",
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  const handleToday = () => {
    setCurrentWeek(new Date())
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {format(weekStart, "dd MMM", { locale: es })} - {format(weekEnd, "dd MMM yyyy", { locale: es })}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por profesional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los profesionales</SelectItem>
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <Card key={day.toISOString()} className={`min-h-[400px] ${isToday ? "ring-2 ring-primary" : ""}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{format(day, "EEEE", { locale: es })}</span>
                  <span className={`text-lg ${isToday ? "text-primary font-bold" : ""}`}>
                    {format(day, "dd", { locale: es })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin citas</p>
                ) : (
                  dayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-2 rounded-md border-l-4 cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(
                          appointment.status,
                        )} ${getPriorityColor(appointment.priority)}`}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs font-medium">{formatTime(appointment.appointment_time)}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs truncate">
                              {appointment.patient?.name} {appointment.patient?.surname}
                            </span>
                          </div>
                          {selectedProfessional === "all" && (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              <span className="text-xs truncate">{appointment.professional?.name}</span>
                            </div>
                          )}
                          {appointment.reason && (
                            <p className="text-xs text-muted-foreground truncate">{appointment.reason}</p>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Estados</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                  <span className="text-xs">Programada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                  <span className="text-xs">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                  <span className="text-xs">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                  <span className="text-xs">No se presentó</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Prioridades</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-l-4 border-l-red-500"></div>
                  <span className="text-xs">Urgente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-l-4 border-l-orange-500"></div>
                  <span className="text-xs">Alta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-l-4 border-l-blue-500"></div>
                  <span className="text-xs">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-l-4 border-l-gray-500"></div>
                  <span className="text-xs">Baja</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Detalles de la Cita
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getPriorityColor(selectedAppointment.priority)}>
                  {selectedAppointment.priority === "urgent"
                    ? "Urgente"
                    : selectedAppointment.priority === "high"
                      ? "Alta"
                      : selectedAppointment.priority === "normal"
                        ? "Normal"
                        : "Baja"}
                </Badge>
                <Badge
                  variant={
                    selectedAppointment.status === "completed"
                      ? "secondary"
                      : selectedAppointment.status === "cancelled"
                        ? "destructive"
                        : "default"
                  }
                >
                  {selectedAppointment.status === "scheduled"
                    ? "Programada"
                    : selectedAppointment.status === "completed"
                      ? "Completada"
                      : selectedAppointment.status === "cancelled"
                        ? "Cancelada"
                        : "No se presentó"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Paciente</h4>
                  <p className="text-sm">
                    {selectedAppointment.patient?.name} {selectedAppointment.patient?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedAppointment.patient?.identifier}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Profesional</h4>
                  <p className="text-sm">
                    {selectedAppointment.professional?.name} {selectedAppointment.professional?.surname}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedAppointment.professional?.specialty}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Fecha</h4>
                    <p className="text-sm">
                      {format(parseISO(selectedAppointment.appointment_date), "PPP", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Hora</h4>
                    <p className="text-sm">{formatTime(selectedAppointment.appointment_time)}</p>
                  </div>
                </div>

                {selectedAppointment.reason && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Motivo</h4>
                    <p className="text-sm">{selectedAppointment.reason}</p>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Notas</h4>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

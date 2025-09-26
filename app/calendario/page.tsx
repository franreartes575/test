"use client"

import { AppointmentCalendar } from "@/components/calendario/cita-calendario"
import { mockAppointments, mockPatients, mockProfessionals } from "@/lib/mock-data"

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendario de Citas</h1>
        <p className="text-muted-foreground mt-2">Vista semanal de todas las citas médicas programadas</p>
      </div>

      <AppointmentCalendar appointments={mockAppointments} patients={mockPatients} professionals={mockProfessionals} />
    </div>
  )
}

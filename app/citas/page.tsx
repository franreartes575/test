"use client"

import { useState } from "react"
import { AppointmentsTable } from "@/components/citas/citas-tabla"
import { mockAppointments, mockPatients, mockProfessionals } from "@/lib/mock-data"
import type { Appointment } from "@/types"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const handleCreateAppointment = (data: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      id: Math.max(...appointments.map((a) => a.id)) + 1,
      patient_id: data.patient_id!,
      professional_id: data.professional_id!,
      appointment_date: data.appointment_date!,
      appointment_time: data.appointment_time!,
      duration: data.duration || 30,
      status: (data.status as "scheduled" | "completed" | "cancelled" | "no_show") || "scheduled",
      priority: (data.priority as "urgent" | "high" | "normal" | "low") || "normal",
      reason: data.reason,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setAppointments([...appointments, newAppointment])
  }

  const handleUpdateAppointment = (id: number, data: Partial<Appointment>) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...data, updated_at: new Date().toISOString() } : appointment,
      ),
    )
  }

  const handleDeleteAppointment = (id: number) => {
    setAppointments(appointments.filter((appointment) => appointment.id !== id))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        <p className="text-muted-foreground mt-2">Administra las citas médicas del centro</p>
      </div>

      <AppointmentsTable
        appointments={appointments}
        patients={mockPatients}
        professionals={mockProfessionals}
        onCreateAppointment={handleCreateAppointment}
        onUpdateAppointment={handleUpdateAppointment}
        onDeleteAppointment={handleDeleteAppointment}
      />
    </div>
  )
}
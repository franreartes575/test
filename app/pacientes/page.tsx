"use client"

import { useState } from "react"
import { PatientsTable } from "@/components/pacientes/pacientes-tabla"
import { mockPatients } from "@/lib/mock-data"
import type { Patient } from "@/types"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)

  const handleCreatePatient = (data: Partial<Patient>) => {
    const newPatient: Patient = {
      id: Math.max(...patients.map((p) => p.id)) + 1,
      name: data.name!,
      surname: data.surname!,
      identifier: data.identifier!,
      phone: data.phone,
      email: data.email,
      insurance: data.insurance,
      address: data.address,
      birth_date: data.birth_date,
      gender: data.gender as "M" | "F" | "Other",
      emergency_contact: data.emergency_contact,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setPatients([...patients, newPatient])
  }

  const handleUpdatePatient = (id: number, data: Partial<Patient>) => {
    setPatients(
      patients.map((patient) =>
        patient.id === id ? { ...patient, ...data, updated_at: new Date().toISOString() } : patient,
      ),
    )
  }

  const handleDeletePatient = (id: number) => {
    setPatients(patients.filter((patient) => patient.id !== id))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
        <p className="text-muted-foreground mt-2">Administra la información de los pacientes del centro médico</p>
      </div>

      <PatientsTable
        patients={patients}
        onCreatePatient={handleCreatePatient}
        onUpdatePatient={handleUpdatePatient}
        onDeletePatient={handleDeletePatient}
      />
    </div>
  )
}

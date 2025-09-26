"use client"

import { useState } from "react"
import { ProfessionalsTable } from "@/components/profesionales/profesionales-tabla"
import { mockProfessionals } from "@/lib/mock-data"
import type { Professional } from "@/types"

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals)

  const handleCreateProfessional = (data: Partial<Professional>) => {
    const newProfessional: Professional = {
      id: Math.max(...professionals.map((p) => p.id)) + 1,
      name: data.name!,
      surname: data.surname!,
      specialty: data.specialty!,
      license_number: data.license_number!,
      phone: data.phone,
      email: data.email,
      working_days: data.working_days || [],
      start_time: data.start_time || "09:00",
      end_time: data.end_time || "17:00",
      consultation_duration: data.consultation_duration || 30,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setProfessionals([...professionals, newProfessional])
  }

  const handleUpdateProfessional = (id: number, data: Partial<Professional>) => {
    setProfessionals(
      professionals.map((professional) =>
        professional.id === id ? { ...professional, ...data, updated_at: new Date().toISOString() } : professional,
      ),
    )
  }

  const handleDeleteProfessional = (id: number) => {
    setProfessionals(professionals.filter((professional) => professional.id !== id))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestión de Profesionales</h1>
        <p className="text-muted-foreground mt-2">
          Administra la información de los profesionales sanitarios del centro médico
        </p>
      </div>

      <ProfessionalsTable
        professionals={professionals}
        onCreateProfessional={handleCreateProfessional}
        onUpdateProfessional={handleUpdateProfessional}
        onDeleteProfessional={handleDeleteProfessional}
      />
    </div>
  )
}

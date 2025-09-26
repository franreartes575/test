"use client"

import { useState } from "react"
import { PatientHistoryTable } from "@/components/historial/historial-tabla"
import { mockPatientHistory, mockPatients, mockProfessionals } from "@/lib/mock-data"
import type { PatientHistory } from "@/types"

export default function HistoryPage() {
  const [history, setHistory] = useState<PatientHistory[]>(mockPatientHistory)

  const handleCreateHistory = (data: Partial<PatientHistory>) => {
    const newHistory: PatientHistory = {
      id: Math.max(...history.map((h) => h.id)) + 1,
      patient_id: data.patient_id!,
      professional_id: data.professional_id!,
      appointment_id: data.appointment_id,
      visit_date: data.visit_date!,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      medications: data.medications,
      notes: data.notes,
      follow_up_date: data.follow_up_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setHistory([...history, newHistory])
  }

  const handleUpdateHistory = (id: number, data: Partial<PatientHistory>) => {
    setHistory(
      history.map((record) =>
        record.id === id ? { ...record, ...data, updated_at: new Date().toISOString() } : record,
      ),
    )
  }

  const handleDeleteHistory = (id: number) => {
    setHistory(history.filter((record) => record.id !== id))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Historia Clínica</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona los registros médicos y el historial clínico de los pacientes
        </p>
      </div>

      <PatientHistoryTable
        history={history}
        patients={mockPatients}
        professionals={mockProfessionals}
        onCreateHistory={handleCreateHistory}
        onUpdateHistory={handleUpdateHistory}
        onDeleteHistory={handleDeleteHistory}
      />
    </div>
  )
}

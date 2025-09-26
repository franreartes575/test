"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Patient } from "@/types"

interface PatientFormProps {
  patient?: Patient
  onSubmit: (data: Partial<Patient>) => void
  onCancel: () => void
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    surname: patient?.surname || "",
    identifier: patient?.identifier || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    insurance: patient?.insurance || "",
    address: patient?.address || "",
    birth_date: patient?.birth_date || "",
    gender: patient?.gender || "",
    emergency_contact: patient?.emergency_contact || "",
    notes: patient?.notes || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Apellidos *</Label>
          <Input
            id="surname"
            value={formData.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">DNI *</Label>
          <Input
            id="identifier"
            value={formData.identifier}
            onChange={(e) => handleChange("identifier", e.target.value)}
            placeholder="DNI"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+54"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurance">Seguro Médico</Label>
          <Input
            id="insurance"
            value={formData.insurance}
            onChange={(e) => handleChange("insurance", e.target.value)}
            placeholder="Sanitas, Adeslas, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleChange("birth_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
              <SelectItem value="Other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
        <Input
          id="emergency_contact"
          value={formData.emergency_contact}
          onChange={(e) => handleChange("emergency_contact", e.target.value)}
          placeholder="Nombre - Teléfono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Alergias, condiciones médicas, etc."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{patient ? "Actualizar" : "Crear"} Paciente</Button>
      </div>
    </form>
  )
}

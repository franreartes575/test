"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import type { Professional } from "@/types"

interface ProfessionalFormProps {
  professional?: Professional
  onSubmit: (data: Partial<Professional>) => void
  onCancel: () => void
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Lunes" },
  { id: "tuesday", label: "Martes" },
  { id: "wednesday", label: "Miércoles" },
  { id: "thursday", label: "Jueves" },
  { id: "friday", label: "Viernes" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
]

export function ProfessionalForm({ professional, onSubmit, onCancel }: ProfessionalFormProps) {
  const [formData, setFormData] = useState({
    name: professional?.name || "",
    surname: professional?.surname || "",
    specialty: professional?.specialty || "",
    license_number: professional?.license_number || "",
    phone: professional?.phone || "",
    email: professional?.email || "",
    working_days: professional?.working_days || [],
    start_time: professional?.start_time || "09:00",
    end_time: professional?.end_time || "17:00",
    consultation_duration: professional?.consultation_duration || 30,
    is_active: professional?.is_active ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    const updatedDays = checked
      ? [...formData.working_days, dayId]
      : formData.working_days.filter((day) => day !== dayId)
    handleChange("working_days", updatedDays)
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
          <Label htmlFor="specialty">Especialidad *</Label>
          <Input
            id="specialty"
            value={formData.specialty}
            onChange={(e) => handleChange("specialty", e.target.value)}
            placeholder="Medicina General, Cardiología, etc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license_number">Número de Colegiado *</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => handleChange("license_number", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+34 600 000 000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Días de Trabajo</Label>
        <div className="grid grid-cols-4 gap-3">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={day.id}
                checked={formData.working_days.includes(day.id)}
                onCheckedChange={(checked) => handleWorkingDayChange(day.id, checked as boolean)}
              />
              <Label htmlFor={day.id} className="text-sm">
                {day.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Hora de Inicio</Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => handleChange("start_time", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">Hora de Fin</Label>
          <Input
            id="end_time"
            type="time"
            value={formData.end_time}
            onChange={(e) => handleChange("end_time", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consultation_duration">Duración Consulta (min)</Label>
          <Input
            id="consultation_duration"
            type="number"
            min="15"
            max="120"
            step="15"
            value={formData.consultation_duration}
            onChange={(e) => handleChange("consultation_duration", Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Profesional Activo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{professional ? "Actualizar" : "Crear"} Profesional</Button>
      </div>
    </form>
  )
}

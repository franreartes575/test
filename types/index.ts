export interface Patient {
  id: number
  name: string
  surname: string
  identifier: string
  phone?: string
  email?: string
  insurance?: string
  address?: string
  birth_date?: string
  gender?: string
  emergency_contact?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Professional {
  id: number
  name: string
  surname: string
  specialty: string
  license_number: string
  phone?: string
  email?: string
  working_days: string[]
  start_time: string
  end_time: string
  consultation_duration: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  professional_id: number
  appointment_date: string
  appointment_time: string
  duration: number
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  priority: "urgent" | "high" | "normal" | "low"
  reason?: string
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  professional?: Professional
}

export interface PatientHistory {
  id: number
  patient_id: number
  professional_id: number
  appointment_id?: number
  visit_date: string
  diagnosis?: string
  treatment?: string
  medications?: string
  notes?: string
  follow_up_date?: string
  created_at: string
  updated_at: string
  professional?: Professional
}

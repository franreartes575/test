export interface User {
  id: string
  username: string
  rol: 'GERENTE' | 'RECEPCIONISTA' | 'PROFESIONAL'
  profesionalId?: string
}

export interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: Date
  sexo: 'MASCULINO' | 'FEMENINO' | 'OTRO'
  telefono?: string
  email?: string
  activo: boolean
  direccion?: string
  fechaAlta: Date
}

export interface Profesional {
  id: string
  nombre: string
  apellido: string
  matricula: string
  especialidadId: string
  especialidad?: Especialidad
  telefono: string | null
  email: string | null
  activo: boolean
  fechaAlta: Date
  agendaProfesional?: AgendaProfesional[]  // Agregar esta línea
 
}

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

export interface AgendaProfesional {
  id: string
  profesionalId: string
  diaSemana: DiaSemana
  horaInicio: Date  // Cambiar de string a Date
  horaFin: Date     // Cambiar de string a Date
  duracionTurno: number
}


export interface Especialidad {
  id: string
  nombre: string
  descripcion?: string
}

export interface Turno {
  id: string
  pacienteId: string
  profesionalId: string
  fecha: Date  // Este es DateTime completo (fecha + hora)
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE'
  motivo?: string
  observaciones?: string
  fechaAlta: Date
  paciente?: Paciente
  profesional?: Profesional
}
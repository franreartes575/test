// pages/profesionales.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, UserCheck, Search, Edit, ArrowLeft, Stethoscope, Filter, AlertTriangle, 
  X, Eye, Calendar, ChevronDown, SlidersHorizontal,
  Phone, Mail, User, RotateCcw, Sparkles,
  Clock, FileText, Activity, ChevronRight, ChevronLeft, Check
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Profesional, Especialidad } from '@/types'

type FiltroEstadoType = 'activos' | 'inactivos' | 'todos'

// Schema de validación extendido con agenda
const profesionalSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  matricula: z.string().min(1, 'La matrícula es requerida'),
  especialidadId: z.string().min(1, 'La especialidad es requerida'),
  telefono: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      return /^(\+54\s?)?(\(?0?\d{2,4}\)?[\s\-]?)?\d{6,8}$/.test(val.trim())
    }, {
      message: 'Formato de teléfono inválido. Ejemplos válidos: +54387123456, 387123456, (387) 123-456'
    }),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  // Datos de agenda/horarios
  diasTrabajo: z.array(z.string()).min(1, 'Debe seleccionar al menos un día'),
  horaInicio: z.string().min(1, 'Hora de inicio requerida'),
  horaFin: z.string().min(1, 'Hora de fin requerida'),
  duracionTurno: z.string().min(1, 'Duración de turno requerida')
})

type ProfesionalFormData = z.infer<typeof profesionalSchema>

// Interfaces para modales
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  profesional: Profesional | null
  isActivating: boolean
}

interface ProfessionalDetailModalProps {
  isOpen: boolean
  onClose: () => void
  profesional: Profesional | null
  onEdit: (profesional: Profesional) => void
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  profesional: Profesional | null
  especialidades: Especialidad[]
  onSave: (data: ProfesionalFormData) => void
}

// Componentes del Multi-Step Form
const StepIndicator = ({ step, isActive, isCompleted, title, icon }: {
  step: number
  isActive: boolean
  isCompleted: boolean
  title: string
  icon: React.ReactNode
}) => (
  <div className="flex items-center">
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
      isCompleted 
        ? 'bg-green-500 border-green-500 text-white' 
        : isActive 
        ? 'bg-purple-500 border-purple-500 text-white' 
        : 'bg-white border-gray-300 text-gray-400'
    }`}>
      {isCompleted ? <Check className="w-5 h-5" /> : icon}
    </div>
    <div className="ml-3">
      <p className={`text-sm font-medium ${isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
        Paso {step}
      </p>
      <p className={`text-xs ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </p>
    </div>
  </div>
)

const StepNavigation = ({ 
  onNext, 
  onPrev, 
  isFirstStep, 
  isLastStep, 
  isSubmitting,
  showNextButton = true 
}: {
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  showNextButton?: boolean
}) => (
  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
    <Button
      type="button"
      variant="outline"
      onClick={onPrev}
      disabled={isFirstStep}
      className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      <ChevronLeft className="w-4 h-4 mr-2" />
      Anterior
    </Button>
    
    {isLastStep ? (
      <Button
        type="submit"
        loading={isSubmitting}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
      >
        Registrar Profesional
      </Button>
    ) : showNextButton ? (
      <Button
        type="button"
        onClick={onNext}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
      >
        Siguiente
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    ) : null}
  </div>
)

// Modal de edición
function EditModal({ isOpen, onClose, profesional, especialidades, onSave }: EditModalProps) {
  // Función helper para convertir DateTime a string HH:mm en hora local (Argentina)
  const dateTimeToTimeString = (date: Date | string): string => {
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ProfesionalFormData>({
    resolver: zodResolver(profesionalSchema),
    mode: 'onChange',
    defaultValues: profesional && isOpen ? {
      nombre: profesional.nombre,
      apellido: profesional.apellido,
      matricula: profesional.matricula,
      especialidadId: profesional.especialidadId,
      telefono: profesional.telefono || '',
      email: profesional.email || '',
      diasTrabajo: profesional.agendaProfesional?.map((agenda: any) => agenda.diaSemana) || [],
      horaInicio: profesional.agendaProfesional?.[0]?.horaInicio ? dateTimeToTimeString(profesional.agendaProfesional[0].horaInicio) : '',
      horaFin: profesional.agendaProfesional?.[0]?.horaFin ? dateTimeToTimeString(profesional.agendaProfesional[0].horaFin) : '',
      duracionTurno: profesional.agendaProfesional?.[0]?.duracionTurno?.toString() || ''
    } : undefined
  })

  useEffect(() => {
    if (profesional && isOpen) {
      const diasTrabajo = profesional.agendaProfesional?.map((agenda: any) => agenda.diaSemana) || []
      const primeraAgenda = profesional.agendaProfesional?.[0]
      
      reset({
        nombre: profesional.nombre,
        apellido: profesional.apellido,
        matricula: profesional.matricula,
        especialidadId: profesional.especialidadId,
        telefono: profesional.telefono || '',
        email: profesional.email || '',
        diasTrabajo: diasTrabajo,
        horaInicio: primeraAgenda?.horaInicio ? dateTimeToTimeString(primeraAgenda.horaInicio) : '',
        horaFin: primeraAgenda?.horaFin ? dateTimeToTimeString(primeraAgenda.horaFin) : '',
        duracionTurno: primeraAgenda?.duracionTurno?.toString() || ''
      })
    }
  }, [profesional, isOpen, reset])

  if (!isOpen || !profesional) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Editar Profesional</h3>
                <p className="text-purple-100">Actualizar información del profesional</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-8">
            {/* Información Profesional */}
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-300">
              <h4 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                <div className="p-2 bg-purple-200 rounded-lg mr-3">
                  <Stethoscope className="w-5 h-5 text-purple-700" />
                </div>
                Información Profesional
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre *"
                  placeholder="Nombre del profesional"
                  {...register('nombre')}
                  error={errors.nombre?.message}
                  className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />

                <Input
                  label="Apellido *"
                  placeholder="Apellido del profesional"
                  {...register('apellido')}
                  error={errors.apellido?.message}
                  className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />

                <Input
                  label="Matrícula *"
                  placeholder="MN12345"
                  {...register('matricula')}
                  error={errors.matricula?.message}
                  className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />

                <Select
                  label="Especialidad *"
                  {...register('especialidadId')}
                  options={especialidades.map(esp => ({
                    value: esp.id,
                    label: esp.nombre
                  }))}
                  placeholder="Seleccionar especialidad"
                  error={errors.especialidadId?.message}
                  className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-gradient-to-br from-green-200 to-green-200 rounded-xl p-6 border border-green-300">
              <h4 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                <div className="p-2 bg-green-300 rounded-lg mr-3">
                  <Phone className="w-5 h-5 text-green-700" />
                </div>
                Información de Contacto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Teléfono"
                  placeholder="+54 387 123-4567"
                  {...register('telefono')}
                  error={errors.telefono?.message}
                  className="bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="doctor@massalud.com"
                  {...register('email')}
                  error={errors.email?.message}
                  className="bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Horarios de Trabajo */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
              <h4 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                <div className="p-2 bg-blue-200 rounded-lg mr-3">
                  <Calendar className="w-5 h-5 text-blue-700" />
                </div>
                Horarios de Trabajo
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Días de trabajo *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'LUNES', label: 'Lunes' },
                      { value: 'MARTES', label: 'Martes' },
                      { value: 'MIERCOLES', label: 'Miércoles' },
                      { value: 'JUEVES', label: 'Jueves' },
                      { value: 'VIERNES', label: 'Viernes' },
                      { value: 'SABADO', label: 'Sábado' },
                      { value: 'DOMINGO', label: 'Domingo' }
                    ].map((dia) => (
                      <label 
                        key={dia.value} 
                        className="relative flex items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          value={dia.value}
                          {...register('diasTrabajo')}
                          className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm font-medium text-slate-700 select-none">{dia.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.diasTrabajo && (
                    <p className="mt-2 text-sm text-red-600">{errors.diasTrabajo.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Hora de inicio *"
                    type="time"
                    {...register('horaInicio')}
                    error={errors.horaInicio?.message}
                    className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />

                  <Input
                    label="Hora de fin *"
                    type="time"
                    {...register('horaFin')}
                    error={errors.horaFin?.message}
                    className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />

                  <Select
                    label="Duración de turno *"
                    {...register('duracionTurno')}
                    options={[
                      { value: '15', label: '15 minutos' },
                      { value: '20', label: '20 minutos' },
                      { value: '30', label: '30 minutos' },
                      { value: '45', label: '45 minutos' },
                      { value: '60', label: '1 hora' }
                    ]}
                    placeholder="Seleccionar duración"
                    error={errors.duracionTurno?.message}
                    className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Modal de detalles del profesional
function ProfessionalDetailModal({ isOpen, onClose, profesional, onEdit }: ProfessionalDetailModalProps) {
  if (!isOpen || !profesional) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Dr/a. {profesional.nombre} {profesional.apellido}
                </h3>
                <p className="text-purple-100 flex items-center mt-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Matrícula: {profesional.matricula}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(profesional)
                  onClose()
                }}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-purple-200 rounded-lg mr-3">
                <User className="w-5 h-5 text-purple-700" />
              </div>
              Información Profesional
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Especialidad</label>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="font-semibold text-slate-900">{profesional.especialidad?.nombre}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Matrícula</label>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="font-semibold text-slate-900">{profesional.matricula}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-200 to-green-200 rounded-xl p-6 border border-green-400">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-green-300 rounded-lg mr-3">
                <Phone className="w-5 h-5 text-green-700" />
              </div>
              Información de Contacto
            </h4>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Teléfono</p>
                      <p className="font-semibold text-slate-900">
                        {profesional.telefono || <span className="text-slate-400 italic">No registrado</span>}
                      </p>
                    </div>
                  </div>
                  {profesional.telefono && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="font-semibold text-slate-900">
                        {profesional.email || <span className="text-slate-400 italic">No registrado</span>}
                      </p>
                    </div>
                  </div>
                  {profesional.email && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-blue-200 rounded-lg mr-3">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              Horarios de Trabajo
            </h4>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              {profesional.agendaProfesional && profesional.agendaProfesional.length > 0 ? (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left font-semibold text-blue-700">Día</th>
                      <th className="px-2 py-1 text-left font-semibold text-blue-700">Hora inicio</th>
                      <th className="px-2 py-1 text-left font-semibold text-blue-700">Hora fin</th>
                      <th className="px-2 py-1 text-left font-semibold text-blue-700">Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profesional.agendaProfesional.map((agenda, idx) => {
                      // Formatear hora
                      const formatTime = (dateVal: string | Date) => {
                        const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
                        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                      }
                      return (
                        <tr key={idx}>
                          <td className="px-2 py-1">{agenda.diaSemana}</td>
                          <td className="px-2 py-1">{formatTime(agenda.horaInicio)}</td>
                          <td className="px-2 py-1">{formatTime(agenda.horaFin)}</td>
                          <td className="px-2 py-1">{agenda.duracionTurno} min</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-600 italic">Información de horarios no disponible</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-orange-200 rounded-lg mr-3">
                <Activity className="w-5 h-5 text-orange-700" />
              </div>
              Estado del Profesional
            </h4>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    profesional.activo 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      profesional.activo ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    {profesional.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Fecha de registro
                  </p>
                  <p className="font-semibold text-slate-900">
                    {new Date(profesional.fechaAlta).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Modal de confirmación
function ConfirmModal({ isOpen, onClose, onConfirm, profesional, isActivating }: ConfirmModalProps) {
  if (!isOpen || !profesional) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
            isActivating ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            <AlertTriangle className={`w-8 h-8 ${
              isActivating ? 'text-green-600' : 'text-yellow-600'
            }`} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {isActivating ? 'Activar Profesional' : 'Desactivar Profesional'}
          </h3>
          
          <p className="text-gray-600 mb-2">
            ¿Estás seguro que deseas {isActivating ? 'activar' : 'desactivar'} a
          </p>
          <p className="font-semibold text-gray-900 mb-6">
            Dr/a. {profesional.nombre} {profesional.apellido}?
          </p>
          
          {!isActivating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                El profesional dejará de aparecer en las listas activas pero se conservarán todos sus datos.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            className={`flex-1 text-white font-semibold ${
              isActivating 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            }`}
          >
            {isActivating ? 'Activar' : 'Desactivar'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ProfesionalesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [loadingProfesionales, setLoadingProfesionales] = useState(true)
  
  // Estados del Multi-Step Form
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoType>('activos')

  // Estados de modales
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    profesional: null as Profesional | null,
    isActivating: false
  })
  
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    profesional: null as Profesional | null
  })

  const [editModal, setEditModal] = useState({
    isOpen: false,
    profesional: null as Profesional | null
  })

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<ProfesionalFormData>({
    resolver: zodResolver(profesionalSchema),
    mode: 'onChange'
  })

  // Verificar autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.rol !== 'GERENTE') {
      addToast({
        type: 'error',
        title: 'Acceso denegado',
        description: 'Solo los gerentes pueden gestionar profesionales'
      })
      router.push('/dashboard')
    }
  }, [user, loading, router, addToast])

  // Cargar datos
  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      if (!user || user.rol !== 'GERENTE') return
      
      try {
        setLoadingProfesionales(true)
        const token = localStorage.getItem('token')
        
        const profResponse = await fetch(`/api/profesionales?filtro=${filtroEstado}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const profData = await profResponse.json()
        
        const espResponse = await fetch('/api/especialidades', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const espData = await espResponse.json()
        
        if (!cancelled) {
          if (profData.success) {
            setProfesionales(profData.profesionales || [])
          } else {
            addToast({
              type: 'error',
              title: 'Error al cargar profesionales',
              description: profData.message || 'No se pudieron cargar los datos'
            })
          }
          
          if (espData.success) {
            setEspecialidades(espData.especialidades || [])
          }
        }
      } catch (error) {
        if (!cancelled) {
          addToast({
            type: 'error',
            title: 'Error al cargar datos',
            description: 'No se pudieron cargar los datos'
          })
        }
      } finally {
        if (!cancelled) {
          setLoadingProfesionales(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [user, filtroEstado])

  // Función para validar el paso actual
  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      const stepFields: (keyof ProfesionalFormData)[] = ['nombre', 'apellido', 'matricula', 'especialidadId']
      const results = await Promise.all(stepFields.map(field => trigger(field)))
      await new Promise(resolve => setTimeout(resolve, 100))
      const hasErrors = stepFields.some(field => errors[field])
      return results.every(Boolean) && !hasErrors
    } else if (currentStep === 2) {
      const stepFields: (keyof ProfesionalFormData)[] = ['telefono', 'email']
      const results = await Promise.all(stepFields.map(field => trigger(field)))
      await new Promise(resolve => setTimeout(resolve, 100))
      const hasErrors = stepFields.some(field => errors[field])
      return results.every(Boolean) && !hasErrors
    }
    return true
  }

  // Filtrar profesionales
  const filteredProfesionales = profesionales.filter(profesional => {
    let matchesEstado = true
    if (filtroEstado === 'activos') {
      matchesEstado = profesional.activo === true
    } else if (filtroEstado === 'inactivos') {
      matchesEstado = profesional.activo === false
    }

    const matchesSearch = profesional.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesional.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesional.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesional.especialidad?.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesEstado && matchesSearch
  })

  const onSubmit = async (data: ProfesionalFormData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profesionales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Profesional registrado',
          description: `Dr/a. ${data.nombre} ${data.apellido} ha sido agregado al sistema`
        })
        
        setProfesionales(prev => [...prev, result.profesional])
        setShowForm(false)
        setCurrentStep(1)
        reset()
      } else {
        addToast({
          type: 'error',
          title: 'Error al registrar',
          description: result.message || 'Ocurrió un error inesperado'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const handleEditSave = async (data: ProfesionalFormData) => {
    if (!editModal.profesional) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profesionales?id=${editModal.profesional.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Profesional actualizado exitosamente',
          description: `Dr/a. ${data.nombre} ${data.apellido} ha sido actualizado correctamente`
        })
        setProfesionales(prev => 
          prev.map(p => p.id === editModal.profesional?.id ? result.profesional : p)
        )
        setEditModal({ isOpen: false, profesional: null })
        setDetailModal({ isOpen: true, profesional: result.profesional })
      } else {
        addToast({
          type: 'error',
          title: 'Error al actualizar profesional',
          description: result.message || 'No se pudo actualizar el profesional'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    }
  }

  const handleToggleActivo = (profesional: Profesional) => {
    setConfirmModal({
      isOpen: true,
      profesional,
      isActivating: !profesional.activo
    })
  }

  const confirmToggleActivo = async () => {
    if (!confirmModal.profesional) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/profesionales?id=${confirmModal.profesional.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: confirmModal.isActivating })
      })

      const result = await response.json()

      if (result.success) {
        const nombreCompleto = `Dr/a. ${confirmModal.profesional.nombre} ${confirmModal.profesional.apellido}`
        addToast({
          type: 'success',
          title: `${nombreCompleto} ${confirmModal.isActivating ? 'activado' : 'desactivado'}`,
          description: `El profesional ha sido ${confirmModal.isActivating ? 'activado' : 'desactivado'} exitosamente`
        })

        setProfesionales(prev => 
          prev.map(p => 
            p.id === confirmModal.profesional?.id 
              ? { ...p, activo: confirmModal.isActivating }
              : p
          )
        )
      } else {
        addToast({
          type: 'error',
          title: 'Error al cambiar estado',
          description: result.message || 'No se pudo actualizar el profesional'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setConfirmModal({ isOpen: false, profesional: null, isActivating: false })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroEstado('activos')
  }

  const hasActiveFilters = searchTerm || filtroEstado !== 'activos'

  const getEmptyStateMessage = () => {
    if (searchTerm || hasActiveFilters) {
      return 'No se encontraron profesionales con los criterios seleccionados'
    }
    return 'Comienza registrando tu primer profesional médico'
  }

  const shouldShowRegisterButton = !searchTerm && !hasActiveFilters && filtroEstado === 'activos'

  if (loading || (user && user.rol !== 'GERENTE')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-purple-200 shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-6 text-slate-600 hover:text-slate-900 hover:bg-purple-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg mr-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Gestión de Profesionales
                  </h1>
                  <p className="text-slate-600 mt-1">Registrar y administrar profesionales del sistema</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Profesional
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario Multi-Step */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg mr-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Registrar Nuevo Profesional</h2>
                    <p className="text-slate-600">Paso {currentStep} de {totalSteps}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setCurrentStep(1)
                    reset()
                  }}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Indicador de pasos */}
              <div className="mb-8">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  <StepIndicator
                    step={1}
                    isActive={currentStep === 1}
                    isCompleted={currentStep > 1}
                    title="Información Profesional"
                    icon={<Stethoscope className="w-5 h-5" />}
                  />
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-200 ${
                    currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <StepIndicator
                    step={2}
                    isActive={currentStep === 2}
                    isCompleted={currentStep > 2}
                    title="Información de Contacto"
                    icon={<Phone className="w-5 h-5" />}
                  />
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-200 ${
                    currentStep > 2 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <StepIndicator
                    step={3}
                    isActive={currentStep === 3}
                    isCompleted={false}
                    title="Horarios de Trabajo"
                    icon={<Calendar className="w-5 h-5" />}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-300">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                          <div className="p-2 bg-purple-200 rounded-lg mr-3">
                            <Stethoscope className="w-5 h-5 text-purple-700" />
                          </div>
                          Información Profesional
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Nombre *"
                            placeholder="Nombre del profesional"
                            {...register('nombre')}
                            error={errors.nombre?.message}
                            className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                          />

                          <Input
                            label="Apellido *"
                            placeholder="Apellido del profesional"
                            {...register('apellido')}
                            error={errors.apellido?.message}
                            className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                          />

                          <Input
                            label="Matrícula *"
                            placeholder="MN12345"
                            {...register('matricula')}
                            error={errors.matricula?.message}
                            className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                          />

                          <Select
                            label="Especialidad *"
                            {...register('especialidadId')}
                            options={especialidades.map(esp => ({
                              value: esp.id,
                              label: esp.nombre
                            }))}
                            placeholder="Seleccionar especialidad"
                            error={errors.especialidadId?.message}
                            className="!bg-purple-50 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-gradient-to-br from-green-200 to-green-200 rounded-xl p-6 border border-green-400">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                          <div className="p-2 bg-green-300 rounded-lg mr-3">
                            <Phone className="w-5 h-5 text-green-700" />
                          </div>
                          Información de Contacto
                          <span className="ml-3 text-sm text-slate-500 font-normal">(Opcional)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Teléfono"
                            placeholder="+54 387 123-4567"
                            {...register('telefono')}
                            error={errors.telefono?.message}
                            className="bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                          />

                          <Input
                            label="Email"
                            type="email"
                            placeholder="doctor@massalud.com"
                            {...register('email')}
                            error={errors.email?.message}
                            className="bg-white border-green-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                          <div className="p-2 bg-blue-200 rounded-lg mr-3">
                            <Calendar className="w-5 h-5 text-blue-700" />
                          </div>
                          Horarios de Trabajo
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                              Días de trabajo *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { value: 'LUNES', label: 'Lunes' },
                                { value: 'MARTES', label: 'Martes' },
                                { value: 'MIERCOLES', label: 'Miércoles' },
                                { value: 'JUEVES', label: 'Jueves' },
                                { value: 'VIERNES', label: 'Viernes' },
                                { value: 'SABADO', label: 'Sábado' },
                                { value: 'DOMINGO', label: 'Domingo' }
                              ].map((dia) => (
                                <label 
                                  key={dia.value} 
                                  className="relative flex items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all"
                                >
                                  <input
                                    type="checkbox"
                                    value={dia.value}
                                    {...register('diasTrabajo')}
                                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                  />
                                  <span className="ml-2 text-sm font-medium text-slate-700 select-none">{dia.label}</span>
                                </label>
                              ))}
                            </div>
                            {errors.diasTrabajo && (
                              <p className="mt-2 text-sm text-red-600">{errors.diasTrabajo.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                              label="Hora de inicio *"
                              type="time"
                              {...register('horaInicio')}
                              error={errors.horaInicio?.message}
                              className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <Input
                              label="Hora de fin *"
                              type="time"
                              {...register('horaFin')}
                              error={errors.horaFin?.message}
                              className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />

                            <Select
                              label="Duración de turno *"
                              {...register('duracionTurno')}
                              options={[
                                { value: '15', label: '15 minutos' },
                                { value: '20', label: '20 minutos' },
                                { value: '30', label: '30 minutos' },
                                { value: '45', label: '45 minutos' },
                                { value: '60', label: '1 hora' }
                              ]}
                              placeholder="Seleccionar duración"
                              error={errors.duracionTurno?.message}
                              className="bg-white border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <StepNavigation
                  onNext={async () => {
                    if (currentStep < totalSteps) {
                      const isValid = await validateCurrentStep()
                      if (isValid) {
                        setCurrentStep(currentStep + 1)
                      } else {
                        addToast({
                          type: 'error',
                          title: 'Campos requeridos',
                          description: 'Por favor completa todos los campos obligatorios correctamente'
                        })
                      }
                    }
                  }}
                  onPrev={() => setCurrentStep(currentStep - 1)}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === totalSteps}
                  isSubmitting={isSubmitting}
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-8 py-6 border-b border-slate-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-slate-700">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Search className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-lg">Buscar y Filtrar</span>
                </div>
                
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {filteredProfesionales.length} resultado{filteredProfesionales.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center space-x-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  placeholder="Buscar por nombre, apellido, matrícula o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-slate-300 focus:border-purple-500 focus:ring-purple-500 bg-slate-50 text-slate-900"
                />
              </div>
              
              <Select
                options={[
                  { value: 'activos', label: 'Solo activos' },
                  { value: 'inactivos', label: 'Solo inactivos' },
                  { value: 'todos', label: 'Todos' }
                ]}
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as FiltroEstadoType)}
                className="w-48 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de profesionales */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-purple-50 px-8 py-6 border-b border-slate-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <UserCheck className="w-6 h-6 mr-3 text-purple-600" />
                Profesionales {filtroEstado === 'activos' ? 'Activos' : filtroEstado === 'inactivos' ? 'Inactivos' : 'Registrados'}
              </h2>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                <Stethoscope className="w-4 h-4 mr-2" />
                {filteredProfesionales.length} profesional{filteredProfesionales.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingProfesionales ? (
              <div className="p-12 text-center">
                <div className="relative mx-auto w-12 h-12 mb-4">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Cargando profesionales...</p>
              </div>
            ) : filteredProfesionales.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Profesional
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredProfesionales.map((profesional) => (
                    <motion.tr
                      key={profesional.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-slate-50 transition-all duration-200 ${!profesional.activo ? 'opacity-75' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {profesional.nombre[0]}{profesional.apellido[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              Dr/a. {profesional.nombre} {profesional.apellido}
                            </div>
                            <div className="text-sm text-slate-500">
                              Profesional médico
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{profesional.matricula}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {profesional.especialidad?.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {profesional.telefono || <span className="text-slate-400 italic">Sin teléfono</span>}
                        </div>
                        <div className="text-sm text-slate-500">
                          {profesional.email || <span className="text-slate-400 italic">Sin email</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivo(profesional)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            profesional.activo ? 'bg-green-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              profesional.activo ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div className="mt-1">
                          <span className={`text-xs font-medium ${profesional.activo ? 'text-green-600' : 'text-slate-500'}`}>
                            {profesional.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDetailModal({ isOpen: true, profesional })}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              console.log('Click en editar desde tabla', profesional)
                              setEditModal({ isOpen: true, profesional })
                            }}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto h-24 w-24 text-slate-400 mb-4">
                  <UserCheck className="w-full h-full" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay profesionales</h3>
                <p className="text-slate-600 mb-6">
                  {getEmptyStateMessage()}
                </p>
                {shouldShowRegisterButton && (
                  <div>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar Primer Profesional
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {detailModal.isOpen && (
          <ProfessionalDetailModal
            isOpen={detailModal.isOpen}
            onClose={() => setDetailModal({ isOpen: false, profesional: null })}
            profesional={detailModal.profesional}
            onEdit={(profesional) => {
              setDetailModal({ isOpen: false, profesional: null })
              setEditModal({ isOpen: true, profesional })
            }}
          />
        )}

        {confirmModal.isOpen && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, profesional: null, isActivating: false })}
            onConfirm={confirmToggleActivo}
            profesional={confirmModal.profesional}
            isActivating={confirmModal.isActivating}
          />
        )}

          {editModal.isOpen && (
            <EditModal
              isOpen={editModal.isOpen}
              onClose={() => setEditModal({ isOpen: false, profesional: null })}
              profesional={editModal.profesional}
              especialidades={especialidades}
              onSave={handleEditSave}
            />
          )}
      </AnimatePresence>
    </div>
  )
}
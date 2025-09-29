// pages/pacientes.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Plus, Users, Search, Edit, ArrowLeft, Filter, AlertTriangle, 
  X, Eye, Calendar, UserCheck, ChevronDown, SlidersHorizontal,
  Phone, Mail, MapPin, User, RotateCcw, Sparkles, Heart,
  Clock, FileText, Activity, ChevronRight, ChevronLeft, Check
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Paciente } from '@/types'
import { pacienteSchema } from '@/lib/validations' 

type FiltroEstadoType = 'activos' | 'inactivos' | 'todos'



type PacienteFormData = z.infer<typeof pacienteSchema>

// Interfaces para modales
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  paciente: Paciente | null
  isActivating: boolean
}

interface PatientDetailModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: Paciente | null
  onEdit: (paciente: Paciente) => void
}

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  paciente: Paciente | null
  onSave: (data: PacienteFormData) => void
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
        ? 'bg-blue-500 border-blue-500 text-white' 
        : 'bg-white border-gray-300 text-gray-400'
    }`}>
      {isCompleted ? <Check className="w-5 h-5" /> : icon}
    </div>
    <div className="ml-3">
      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
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
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
      >
        Registrar Paciente
      </Button>
    ) : showNextButton ? (
      <Button
        type="button"
        onClick={onNext}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
      >
        Siguiente
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    ) : null}
  </div>
)

// Modal de detalles del paciente
function PatientDetailModal({ isOpen, onClose, paciente, onEdit }: PatientDetailModalProps) {
  if (!isOpen || !paciente) return null

  const calcularEdad = (fechaNacimiento: Date) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 border-slate-200">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {paciente.nombre} {paciente.apellido}
                </h3>
                <p className="text-blue-100 flex items-center mt-1">
                  <FileText className="w-4 h-4 mr-2" />
                  DNI: {paciente.dni}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(paciente)}
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

        <div className="p-8 space-y-8 max-h-[calc(90vh-120px)] overflow-y-auto ">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-blue-200 rounded-lg mr-3">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              Información Personal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Fecha de Nacimiento</label>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">
                    {new Date(paciente.fechaNacimiento).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-blue-600 text-sm font-medium mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {calcularEdad(paciente.fechaNacimiento)} años
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Sexo</label>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="font-semibold text-slate-900">{paciente.sexo}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-200 to-green-200 rounded-xl p-6 border border-green-400">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-green-300 rounded-lg mr-3">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              Información de Contacto
            </h4>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Teléfono</p>
                      <p className="font-semibold text-slate-900">
                        {paciente.telefono || <span className="text-slate-400 italic">No registrado</span>}
                      </p>
                    </div>
                  </div>
                  {paciente.telefono && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="font-semibold text-slate-900">
                        {paciente.email || <span className="text-slate-400 italic">No registrado</span>}
                      </p>
                    </div>
                  </div>
                  {paciente.email && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Dirección</p>
                      <p className="font-semibold text-slate-900">
                        {paciente.direccion || <span className="text-slate-400 italic">No registrada</span>}
                      </p>
                    </div>
                  </div>
                  {paciente.direccion && (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-orange-200  rounded-lg mr-3">
                <Activity className="w-5 h-5 text-orange-700" />
              </div>
              Estado del Paciente
            </h4>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    paciente.activo 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      paciente.activo ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    {paciente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Fecha de registro
                  </p>
                  <p className="font-semibold text-slate-900">
                    {new Date(paciente.fechaAlta).toLocaleDateString('es-ES', {
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

// Modal de edición
function EditModal({ isOpen, onClose, paciente, onSave }: EditModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    mode: 'onChange'
  })

  useEffect(() => {
    if (paciente && isOpen) {
      const formatearFecha = (fecha: string | Date) => {
        const fechaObj = new Date(fecha)
        return fechaObj.toISOString().split('T')[0]
      }

      reset({
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        fechaNacimiento: formatearFecha(paciente.fechaNacimiento),
        sexo: paciente.sexo,
        telefono: paciente.telefono || '',
        email: paciente.email || '',
        direccion: paciente.direccion || ''
      })
    }
  }, [paciente, isOpen, reset])

  if (!isOpen || !paciente) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Edit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Editar Paciente</h3>
                <p className="text-emerald-100">Actualizar información del paciente</p>
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
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
              <h4 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                <div className="p-2 bg-blue-200 rounded-lg mr-3">
                  <User className="w-5 h-5 text-blue-700" />
                </div>
                Información Personal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre *"
                  placeholder="Nombre del paciente"
                  {...register('nombre')}
                  error={errors.nombre?.message}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />

                <Input
                  label="Apellido *"
                  placeholder="Apellido del paciente"
                  {...register('apellido')}
                  error={errors.apellido?.message}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />

                <Input
                  label="DNI *"
                  placeholder="12345678"
                  {...register('dni')}
                  error={errors.dni?.message}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />

                <Input
                  label="Fecha de Nacimiento *"
                  type="date"
                  {...register('fechaNacimiento')}
                  error={errors.fechaNacimiento?.message}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />

                <Select
                  label="Sexo *"
                  {...register('sexo')}
                  options={[
                    { value: 'MASCULINO', label: 'Masculino' },
                    { value: 'FEMENINO', label: 'Femenino' },
                    { value: 'OTRO', label: 'Otro' }
                  ]}
                  placeholder="Seleccionar sexo"
                  error={errors.sexo?.message}
                  className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-200 to-green-200 rounded-xl p-6 border border-green-400">
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
                  className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="paciente@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                  className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    placeholder="Dirección completa"
                    {...register('direccion')}
                    error={errors.direccion?.message}
                    className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
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
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Modal de confirmación
function ConfirmModal({ isOpen, onClose, onConfirm, paciente, isActivating }: ConfirmModalProps) {
  if (!isOpen || !paciente) return null

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
            {isActivating ? 'Activar Paciente' : 'Desactivar Paciente'}
          </h3>
          
          <p className="text-gray-600 mb-2">
            ¿Estás seguro que deseas {isActivating ? 'activar' : 'desactivar'} a
          </p>
          <p className="font-semibold text-gray-900 mb-6">
            {paciente.nombre} {paciente.apellido}?
          </p>
          
          {!isActivating && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                El paciente dejará de aparecer en las listas activas pero se conservarán todos sus datos.
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

export default function PacientesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [loadingPacientes, setLoadingPacientes] = useState(true)
  
  // Estados del Multi-Step Form
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoType>('activos')
  const [filtroEdadMin, setFiltroEdadMin] = useState('')
  const [filtroEdadMax, setFiltroEdadMax] = useState('')
  const [filtroFechaRegistroInicio, setFiltroFechaRegistroInicio] = useState('')
  const [filtroFechaRegistroFin, setFiltroFechaRegistroFin] = useState('')

  // Estados de modales
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    paciente: null as Paciente | null,
    isActivating: false
  })
  
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    paciente: null as Paciente | null
  })
  
  const [editModal, setEditModal] = useState({
    isOpen: false,
    paciente: null as Paciente | null
  })

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    mode: 'onChange'
  })

  // Verificar autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Cargar pacientes
  useEffect(() => {
    let cancelled = false

    const fetchPacientes = async () => {
      if (!user) return
      
      try {
        setLoadingPacientes(true)
        const token = localStorage.getItem('token')
        
        const url = `/api/pacientes?filtro=${filtroEstado}`
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        
        if (!cancelled) {
          if (data.success) {
            setPacientes(data.pacientes || [])
          } else {
            addToast({
              type: 'error',
              title: 'Error al cargar pacientes',
              description: data.message || 'No se pudieron cargar los datos'
            })
          }
        }
      } catch (error) {
        if (!cancelled) {
          addToast({
            type: 'error',
            title: 'Error al cargar pacientes',
            description: 'No se pudieron cargar los datos'
          })
        }
      } finally {
        if (!cancelled) {
          setLoadingPacientes(false)
        }
      }
    }

    fetchPacientes()

    return () => {
      cancelled = true
    }
  }, [user, filtroEstado])

  // Función para validar el paso actual mejorada
  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      const stepFields: (keyof PacienteFormData)[] = ['nombre', 'apellido', 'dni', 'fechaNacimiento', 'sexo']
      
      // Forzar validación de todos los campos del paso
      const results = await Promise.all(
        stepFields.map(field => trigger(field))
      )
      
      // Verificar que no hay errores después de la validación
      await new Promise(resolve => setTimeout(resolve, 100)) // Pequeño delay para que se actualicen los errores
      const hasErrors = stepFields.some(field => errors[field])
      
      return results.every(Boolean) && !hasErrors
    }
    return true
  }

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento: Date) => {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  // Filtrar pacientes
  const filteredPacientes = pacientes.filter(paciente => {
    let matchesEstado = true
    if (filtroEstado === 'activos') {
      matchesEstado = paciente.activo === true
    } else if (filtroEstado === 'inactivos') {
      matchesEstado = paciente.activo === false
    }

    const matchesSearch = paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paciente.dni.includes(searchTerm)

    const edad = calcularEdad(paciente.fechaNacimiento)
    const matchesEdadMin = !filtroEdadMin || edad >= parseInt(filtroEdadMin)
    const matchesEdadMax = !filtroEdadMax || edad <= parseInt(filtroEdadMax)

    const fechaRegistro = new Date(paciente.fechaAlta)
    const matchesFechaInicio = !filtroFechaRegistroInicio || 
                              fechaRegistro >= new Date(filtroFechaRegistroInicio)
    const matchesFechaFin = !filtroFechaRegistroFin || 
                           fechaRegistro <= new Date(filtroFechaRegistroFin)

    return matchesEstado && matchesSearch && matchesEdadMin && matchesEdadMax && matchesFechaInicio && matchesFechaFin
  })

  const onSubmit = async (data: PacienteFormData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/pacientes', {
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
          title: 'Paciente registrado',
          description: `${data.nombre} ${data.apellido} ha sido agregado al sistema`
        })
        
        setPacientes(prev => [...prev, result.paciente])
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

  const handleEditSave = async (data: PacienteFormData) => {
    if (!editModal.paciente) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/pacientes?id=${editModal.paciente.id}`, {
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
          title: 'Paciente actualizado exitosamente',
          description: `${data.nombre} ${data.apellido} ha sido actualizado correctamente`
        })
        
        setPacientes(prev => 
          prev.map(p => p.id === editModal.paciente?.id ? result.paciente : p)
        )
        setEditModal({ isOpen: false, paciente: null })
        setDetailModal({ isOpen: false, paciente: null })
      } else {
        addToast({
          type: 'error',
          title: 'Error al actualizar paciente',
          description: result.message || 'No se pudo actualizar el paciente'
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

  const handleToggleActivo = (paciente: Paciente) => {
    setConfirmModal({
      isOpen: true,
      paciente,
      isActivating: !paciente.activo
    })
  }

  const confirmToggleActivo = async () => {
    if (!confirmModal.paciente) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/pacientes?id=${confirmModal.paciente.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activo: confirmModal.isActivating })
      })

      const result = await response.json()

      if (result.success) {
        const nombreCompleto = `${confirmModal.paciente.nombre} ${confirmModal.paciente.apellido}`
        addToast({
          type: 'success',
          title: `${nombreCompleto} ${confirmModal.isActivating ? 'activado' : 'desactivado'}`,
          description: `El paciente ha sido ${confirmModal.isActivating ? 'activado' : 'desactivado'} exitosamente`
        })

        setPacientes(prev => 
          prev.map(p => 
            p.id === confirmModal.paciente?.id 
              ? { ...p, activo: confirmModal.isActivating }
              : p
          )
        )
      } else {
        addToast({
          type: 'error',
          title: 'Error al cambiar estado',
          description: result.message || 'No se pudo actualizar el paciente'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setConfirmModal({ isOpen: false, paciente: null, isActivating: false })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroEstado('activos')
    setFiltroEdadMin('')
    setFiltroEdadMax('')
    setFiltroFechaRegistroInicio('')
    setFiltroFechaRegistroFin('')
  }

  const hasActiveFilters = searchTerm || filtroEstado !== 'activos' || filtroEdadMin || 
                          filtroEdadMax || filtroFechaRegistroInicio || filtroFechaRegistroFin

  const getEmptyStateMessage = () => {
    if (searchTerm || hasActiveFilters) {
      return 'No se encontraron pacientes con los criterios seleccionados'
    }
    return 'Comienza registrando tu primer paciente'
  }

  const shouldShowRegisterButton = !searchTerm && !hasActiveFilters && filtroEstado === 'activos'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-blue-400 shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-6 text-slate-600 hover:text-slate-900 hover:bg-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mr-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Gestión de Pacientes
                  </h1>
                  <p className="text-slate-600 mt-1">Registrar y administrar pacientes del sistema</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Paciente
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
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl shadow-lg mr-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Registrar Nuevo Paciente</h2>
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
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <StepIndicator
                    step={1}
                    isActive={currentStep === 1}
                    isCompleted={currentStep > 1}
                    title="Información Personal"
                    icon={<User className="w-5 h-5" />}
                  />
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-colors duration-200 ${
                    currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <StepIndicator
                    step={2}
                    isActive={currentStep === 2}
                    isCompleted={false}
                    title="Información de Contacto"
                    icon={<Phone className="w-5 h-5" />}
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
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-300">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center text-lg">
                          <div className="p-2 bg-blue-200 rounded-lg mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Nombre *"
                            placeholder="Nombre del paciente"
                            {...register('nombre')}
                            error={errors.nombre?.message}
                            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />

                          <Input
                            label="Apellido *"
                            placeholder="Apellido del paciente"
                            {...register('apellido')}
                            error={errors.apellido?.message}
                            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />

                          <Input
                            label="DNI *"
                            placeholder="12345678"
                            {...register('dni')}
                            error={errors.dni?.message}
                            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />

                          <Input
                            label="Fecha de Nacimiento *"
                            type="date"
                            {...register('fechaNacimiento')}
                            error={errors.fechaNacimiento?.message}
                            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />

                          <div className="md:col-span-2">
                            <Select
                              label="Sexo *"
                              {...register('sexo')}
                              options={[
                                { value: 'MASCULINO', label: 'Masculino' },
                                { value: 'FEMENINO', label: 'Femenino' },
                                { value: 'OTRO', label: 'Otro' }
                              ]}
                              placeholder="Seleccionar sexo"
                              error={errors.sexo?.message}
                              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
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
                            <Phone className="w-5 h-5 text-emerald-600" />
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
                            className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />

                          <Input
                            label="Email"
                            type="email"
                            placeholder="paciente@email.com"
                            {...register('email')}
                            error={errors.email?.message}
                            className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                          />

                          <div className="md:col-span-2">
                            <Input
                              label="Dirección"
                              placeholder="Dirección completa"
                              {...register('direccion')}
                              error={errors.direccion?.message}
                              className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <StepNavigation
                  onNext={async () => {
                    if (currentStep === 1) {
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
                    } else {
                      // Para el paso 2, solo navegar (no hacer submit)
                      setCurrentStep(currentStep + 1)
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
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-slate-700">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-lg">Buscar y Filtrar</span>
                </div>
                
                {hasActiveFilters && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    <Sparkles className="w-4 h-4 mr-1" />
                    {filteredPacientes.length} resultado{filteredPacientes.length !== 1 ? 's' : ''}
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
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros Avanzados
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
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
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500 bg-slate-50 text-slate-900"
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
                className="w-48 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200"
              >
                <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-blue-50">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    Filtros Avanzados
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                        Rango de Edad
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filtroEdadMin}
                          onChange={(e) => setFiltroEdadMin(e.target.value)}
                          className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filtroEdadMax}
                          onChange={(e) => setFiltroEdadMax(e.target.value)}
                          className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        Fecha de Registro (Desde)
                      </label>
                      <Input
                        type="date"
                        value={filtroFechaRegistroInicio}
                        onChange={(e) => setFiltroFechaRegistroInicio(e.target.value)}
                        className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        Fecha de Registro (Hasta)
                      </label>
                      <Input
                        type="date"
                        value={filtroFechaRegistroFin}
                        onChange={(e) => setFiltroFechaRegistroFin(e.target.value)}
                        className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Resetear todo
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lista de pacientes */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Pacientes {filtroEstado === 'activos' ? 'Activos' : filtroEstado === 'inactivos' ? 'Inactivos' : 'Registrados'}
              </h2>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <Heart className="w-4 h-4 mr-2" />
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingPacientes ? (
              <div className="p-12 text-center">
                <div className="relative mx-auto w-12 h-12 mb-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">Cargando pacientes...</p>
              </div>
            ) : filteredPacientes.length > 0 ? (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Edad
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
                  {filteredPacientes.map((paciente) => (
                    <motion.tr
                      key={paciente.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-slate-50 transition-all duration-200 ${!paciente.activo ? 'opacity-75' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {paciente.nombre[0]}{paciente.apellido[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {paciente.nombre} {paciente.apellido}
                            </div>
                            <div className="text-sm text-slate-500">
                              {paciente.sexo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{paciente.dni}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {calcularEdad(paciente.fechaNacimiento)} años
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(paciente.fechaNacimiento).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {paciente.telefono || <span className="text-slate-400 italic">Sin teléfono</span>}
                        </div>
                        <div className="text-sm text-slate-500">
                          {paciente.email || <span className="text-slate-400 italic">Sin email</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActivo(paciente)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            paciente.activo ? 'bg-green-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              paciente.activo ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div className="mt-1">
                          <span className={`text-xs font-medium ${paciente.activo ? 'text-green-600' : 'text-slate-500'}`}>
                            {paciente.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDetailModal({ isOpen: true, paciente })}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditModal({ isOpen: true, paciente })}
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
                  <Users className="w-full h-full" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pacientes</h3>
                <p className="text-slate-600 mb-6">
                  {getEmptyStateMessage()}
                </p>
                {shouldShowRegisterButton && (
                  <div>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar Primer Paciente
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
          <PatientDetailModal
            isOpen={detailModal.isOpen}
            onClose={() => setDetailModal({ isOpen: false, paciente: null })}
            paciente={detailModal.paciente}
            onEdit={(paciente) => {
              setDetailModal({ isOpen: false, paciente: null })
              setEditModal({ isOpen: true, paciente })
            }}
          />
        )}

        {editModal.isOpen && (
          <EditModal
            isOpen={editModal.isOpen}
            onClose={() => setEditModal({ isOpen: false, paciente: null })}
            paciente={editModal.paciente}
            onSave={handleEditSave}
          />
        )}

        {confirmModal.isOpen && (
          <ConfirmModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, paciente: null, isActivating: false })}
            onConfirm={confirmToggleActivo}
            paciente={confirmModal.paciente}
            isActivating={confirmModal.isActivating}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
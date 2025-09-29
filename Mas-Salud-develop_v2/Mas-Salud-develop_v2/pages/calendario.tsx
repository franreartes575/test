// pages/calendario.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft,
  Grid,
  List,
  CalendarDays,
  MapPin,
  X,
  Eye
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import type { Turno } from '@/types'

type VistaType = 'dia' | 'semana' | 'mes'
type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE'

import type { Paciente, Profesional } from '@/types'

interface TurnoDetalle extends Turno {
  paciente: Paciente
  profesional: Profesional & {
    especialidad?: {
      nombre: string
    }
  }
}

// Configuración de colores por estado
const estadoConfig = {
  PENDIENTE: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
    icon: Clock,
    label: 'Pendiente',
    gradient: 'from-yellow-400 to-amber-500'
  },
  CONFIRMADO: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    icon: CheckCircle,
    label: 'Confirmado',
    gradient: 'from-blue-400 to-indigo-500'
  },
  ATENDIDO: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    dot: 'bg-green-500',
    icon: CheckCircle,
    label: 'Atendido',
    gradient: 'from-green-400 to-emerald-500'
  },
  CANCELADO: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-500',
    icon: XCircle,
    label: 'Cancelado',
    gradient: 'from-red-400 to-rose-500'
  },
  AUSENTE: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
    icon: AlertCircle,
    label: 'Ausente',
    gradient: 'from-gray-400 to-slate-500'
  }
}

// Modal de detalle del turno
interface TurnoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  turno: TurnoDetalle | null
}

function TurnoDetailModal({ isOpen, onClose, turno }: TurnoDetailModalProps) {
  if (!isOpen || !turno) return null

  const config = estadoConfig[turno.estado as EstadoTurno]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className={`relative bg-gradient-to-r ${config.gradient} px-8 py-6`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Detalle del Turno</h3>
                <p className="text-white/90 flex items-center mt-1">
                  <Icon className="w-4 h-4 mr-2" />
                  Estado: {config.label}
                </p>
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

        <div className="p-8 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Información del Turno */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-orange-200 rounded-lg mr-3">
                <Clock className="w-5 h-5 text-orange-700" />
              </div>
              Información del Turno
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Fecha</p>
                <p className="font-semibold text-slate-900">
                  {new Date(turno.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Hora</p>
                <p className="font-semibold text-slate-900">
                  {new Date(turno.fecha).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {turno.motivo && (
              <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm font-medium text-slate-600 mb-1">Motivo de consulta</p>
                <p className="text-slate-900">{turno.motivo}</p>
              </div>
            )}
          </div>

          {/* Información del Paciente */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-orange-200 rounded-lg mr-3">
                <User className="w-5 h-5 text-orange-700" />
              </div>
              Información del Paciente
            </h4>
            <div className="space-y-3">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Nombre completo</p>
                    <p className="font-semibold text-slate-900">
                      {turno.paciente.nombre} {turno.paciente.apellido}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">DNI</p>
                    <p className="font-semibold text-slate-900">{turno.paciente.dni}</p>
                  </div>
                </div>
              </div>
              {turno.paciente.telefono && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Teléfono</p>
                      <p className="font-semibold text-slate-900">{turno.paciente.telefono}</p>
                    </div>
                  </div>
                </div>
              )}
              {turno.paciente.email && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Email</p>
                      <p className="font-semibold text-slate-900">{turno.paciente.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Profesional */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-300">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
              <div className="p-2 bg-orange-200 rounded-lg mr-3">
                <Stethoscope className="w-5 h-5 text-orange-700" />
              </div>
              Profesional Asignado
            </h4>
            <div className="space-y-3">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Profesional</p>
                    <p className="font-semibold text-slate-900">
                      Dr/a. {turno.profesional.nombre} {turno.profesional.apellido}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-600">Matrícula</p>
                    <p className="font-semibold text-slate-900">{turno.profesional.matricula}</p>
                  </div>
                </div>
              </div>
              {turno.profesional.especialidad && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-medium text-slate-600 mb-1">Especialidad</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-200 text-orange-800">
                    {turno.profesional.especialidad.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          {turno.observaciones && (
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border border-orange-300">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center text-lg">
                <div className="p-2 bg-orange-200 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                Observaciones
              </h4>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-slate-900">{turno.observaciones}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Componente de turno individual
function TurnoCard({ turno, onClick }: { turno: TurnoDetalle; onClick: () => void }) {
  const config = estadoConfig[turno.estado as EstadoTurno]
  const Icon = config.icon

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border-2 ${config.border} ${config.bg} hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
          <span className={`text-xs font-semibold ${config.text}`}>
            {new Date(turno.fecha).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <Icon className={`w-4 h-4 ${config.text}`} />
      </div>
      <p className="font-semibold text-slate-900 text-sm mb-1">
        {turno.paciente.nombre} {turno.paciente.apellido}
      </p>
      <p className="text-xs text-slate-600">
        Dr/a. {turno.profesional.nombre} {turno.profesional.apellido}
      </p>
    </motion.button>
  )
}

export default function CalendarioPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  
  const [vista, setVista] = useState<VistaType>('dia')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [turnos, setTurnos] = useState<TurnoDetalle[]>([])
  const [loadingTurnos, setLoadingTurnos] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroProfesional, setFiltroProfesional] = useState<string>('todos')
  const [profesionales, setProfesionales] = useState<any[]>([])
  
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    turno: null as TurnoDetalle | null
  })

  // Verificar autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Cargar profesionales
  useEffect(() => {
    const fetchProfesionales = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/profesionales?filtro=activos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setProfesionales(data.profesionales)
        }
      } catch (error) {
        console.error('Error al cargar profesionales:', error)
      }
    }

    if (user) {
      fetchProfesionales()
    }
  }, [user])

  // Cargar turnos
  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        setLoadingTurnos(true)
        const token = localStorage.getItem('token')
        const response = await fetch('/api/turnos', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setTurnos(data.turnos)
        }
      } catch (error) {
        console.error('Error al cargar turnos:', error)
        addToast({
          type: 'error',
          title: 'Error al cargar turnos',
          description: 'No se pudieron cargar los turnos'
        })
      } finally {
        setLoadingTurnos(false)
      }
    }

    if (user) {
      fetchTurnos()
    }
  }, [user])

  // Filtrar turnos
  const turnosFiltrados = turnos.filter(turno => {
    // Filtro por estado
    if (filtroEstado !== 'todos' && turno.estado !== filtroEstado) {
      return false
    }

    // Filtro por profesional
    if (filtroProfesional !== 'todos' && turno.profesionalId !== filtroProfesional) {
      return false
    }

    const turnoDate = new Date(turno.fecha)

    // Filtro por vista
    if (vista === 'dia') {
      return (
        turnoDate.getDate() === fechaSeleccionada.getDate() &&
        turnoDate.getMonth() === fechaSeleccionada.getMonth() &&
        turnoDate.getFullYear() === fechaSeleccionada.getFullYear()
      )
    } else if (vista === 'semana') {
      const inicioSemana = new Date(fechaSeleccionada)
      inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay())
      const finSemana = new Date(inicioSemana)
      finSemana.setDate(inicioSemana.getDate() + 6)
      
      return turnoDate >= inicioSemana && turnoDate <= finSemana
    } else if (vista === 'mes') {
      return (
        turnoDate.getMonth() === fechaSeleccionada.getMonth() &&
        turnoDate.getFullYear() === fechaSeleccionada.getFullYear()
      )
    }

    return true
  })

  // Agrupar turnos por día
  const turnosPorDia = turnosFiltrados.reduce((acc, turno) => {
    const fecha = new Date(turno.fecha).toDateString()
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(turno)
    return acc
  }, {} as Record<string, TurnoDetalle[]>)

  // Ordenar turnos por hora
  Object.keys(turnosPorDia).forEach(fecha => {
    turnosPorDia[fecha].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )
  })

  // Navegación de fecha
  const cambiarFecha = (direccion: 'anterior' | 'siguiente') => {
    const nuevaFecha = new Date(fechaSeleccionada)
    
    if (vista === 'dia') {
      nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 1 : -1))
    } else if (vista === 'semana') {
      nuevaFecha.setDate(nuevaFecha.getDate() + (direccion === 'siguiente' ? 7 : -7))
    } else if (vista === 'mes') {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + (direccion === 'siguiente' ? 1 : -1))
    }
    
    setFechaSeleccionada(nuevaFecha)
  }

  const irHoy = () => {
    setFechaSeleccionada(new Date())
  }

  // Generar días de la semana
  const getDiasSemana = () => {
    const dias = []
    const inicioSemana = new Date(fechaSeleccionada)
    inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay())
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana)
      dia.setDate(inicioSemana.getDate() + i)
      dias.push(dia)
    }
    
    return dias
  }

  // Generar días del mes
  const getDiasMes = () => {
    const primerDia = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1)
    const ultimoDia = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0)
    
    const dias = []
    const primerDiaSemana = primerDia.getDay()
    
    // Días del mes anterior
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(primerDia)
      dia.setDate(dia.getDate() - (i + 1))
      dias.push({ fecha: dia, esDelMes: false })
    }
    
    // Días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const dia = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), i)
      dias.push({ fecha: dia, esDelMes: true })
    }
    
    // Días del siguiente mes
    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ultimoDia)
      dia.setDate(dia.getDate() + i)
      dias.push({ fecha: dia, esDelMes: false })
    }
    
    return dias
  }

  const obtenerTextoFecha = () => {
    if (vista === 'dia') {
      return fechaSeleccionada.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (vista === 'semana') {
      const inicioSemana = new Date(fechaSeleccionada)
      inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay())
      const finSemana = new Date(inicioSemana)
      finSemana.setDate(inicioSemana.getDate() + 6)
      
      return `${inicioSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${finSemana.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
    } else {
      return fechaSeleccionada.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Cargando calendario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-orange-200 shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-6 text-slate-600 hover:text-slate-900 hover:bg-orange-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg mr-4">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Calendario de Turnos
                  </h1>
                  <p className="text-slate-600 mt-1">Visualiza y gestiona los turnos programados</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={irHoy}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Hoy
              </Button>
              <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setVista('dia')}
                  className={`px-4 py-2 rounded-l-lg font-medium transition-colors ${
                    vista === 'dia'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVista('semana')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    vista === 'semana'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVista('mes')}
                  className={`px-4 py-2 rounded-r-lg font-medium transition-colors ${
                    vista === 'mes'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles de navegación y filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cambiarFecha('anterior')}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl font-bold text-slate-900 capitalize">
                {obtenerTextoFecha()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cambiarFecha('siguiente')}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-slate-600" />
              {/* Filtro por Estado */}
              <Select
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'PENDIENTE', label: 'Pendientes' },
                  { value: 'CONFIRMADO', label: 'Confirmados' },
                  { value: 'ATENDIDO', label: 'Atendidos' },
                  { value: 'CANCELADO', label: 'Cancelados' }
                ]}
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-56"
              />
              {/* Filtro por Profesional */}
              <Select
                options={[
                  { value: 'todos', label: 'Todos los profesionales' },
                  ...profesionales.map(prof => ({
                    value: prof.id,
                    label: `Dr/a. ${prof.nombre} ${prof.apellido}`
                  }))
                ]}
                value={filtroProfesional}
                onChange={(e) => setFiltroProfesional(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          {/* Leyenda de estados */}
          <div className="flex items-center space-x-4 flex-wrap">
            <span className="text-sm font-medium text-slate-600">Leyenda:</span>
            {Object.entries(estadoConfig).map(([estado, config]) => {
              const Icon = config.icon
              return (
                <div key={estado} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.dot}`}></div>
                  <span className="text-sm text-slate-600">{config.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vista del calendario */}
        <AnimatePresence mode="wait">
          {loadingTurnos ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
              <div className="relative mx-auto w-12 h-12 mb-4">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">Cargando turnos...</p>
            </div>
          ) : vista === 'dia' ? (
            <motion.div
              key="vista-dia"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-orange-600" />
                Turnos del día ({turnosFiltrados.length})
              </h3>
              
              {turnosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turnosFiltrados.map((turno, index) => (
                    <motion.div
                      key={turno.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TurnoCard
                        turno={turno}
                        onClick={() => setDetailModal({ isOpen: true, turno })}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay turnos</h3>
                  <p className="text-slate-600">
                    No se encontraron turnos para este día con los filtros aplicados
                  </p>
                </div>
              )}
            </motion.div>
          ) : vista === 'semana' ? (
            <motion.div
              key="vista-semana"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="grid grid-cols-7 border-b border-slate-200">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
                  <div
                    key={dia}
                    className={`p-4 text-center font-semibold text-slate-700 ${
                      index === 0 || index === 6 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {getDiasSemana().map((dia, index) => {
                  const turnosDelDia = turnosPorDia[dia.toDateString()] || []
                  const esHoy = dia.toDateString() === new Date().toDateString()
                  const esFinde = dia.getDay() === 0 || dia.getDay() === 6
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[200px] p-3 border-r border-b border-slate-100 ${
                        esFinde ? 'bg-slate-50' : 'bg-white'
                      } ${esHoy ? 'ring-2 ring-orange-500 ring-inset' : ''}`}
                    >
                      <div className={`text-center mb-3 ${esHoy ? 'text-orange-600 font-bold' : 'text-slate-900'}`}>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          esHoy ? 'bg-orange-600 text-white' : ''
                        }`}>
                          {dia.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {turnosDelDia.slice(0, 3).map((turno, idx) => (
                          <motion.div
                            key={turno.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <TurnoCard
                              turno={turno}
                              onClick={() => setDetailModal({ isOpen: true, turno })}
                            />
                          </motion.div>
                        ))}
                        {turnosDelDia.length > 3 && (
                          <div className="text-center text-xs text-slate-500 font-medium pt-1">
                            +{turnosDelDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="vista-mes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                  <div key={dia} className="p-3 text-center font-semibold text-slate-700">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {getDiasMes().map(({ fecha, esDelMes }, index) => {
                  const turnosDelDia = turnosPorDia[fecha.toDateString()] || []
                  const esHoy = fecha.toDateString() === new Date().toDateString()
                  const esFinde = fecha.getDay() === 0 || fecha.getDay() === 6
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border-r border-b border-slate-100 ${
                        esFinde ? 'bg-slate-50' : 'bg-white'
                      } ${!esDelMes ? 'opacity-40' : ''}`}
                    >
                      <div className={`text-sm mb-1 ${
                        esHoy 
                          ? 'text-orange-600 font-bold' 
                          : esDelMes 
                            ? 'text-slate-900' 
                            : 'text-slate-400'
                      }`}>
                        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          esHoy ? 'bg-orange-600 text-white' : ''
                        }`}>
                          {fecha.getDate()}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {turnosDelDia.slice(0, 2).map((turno, idx) => (
                          <motion.div
                            key={turno.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div
                              onClick={() => setDetailModal({ isOpen: true, turno })}
                              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                                estadoConfig[turno.estado as EstadoTurno].bg
                              } ${estadoConfig[turno.estado as EstadoTurno].border}`}
                            >
                              <div className="flex items-center space-x-1">
                                <div className={`w-1 h-1 rounded-full ${
                                  estadoConfig[turno.estado as EstadoTurno].dot
                                }`}></div>
                                <span className="font-medium truncate">
                                  {new Date(turno.fecha).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="truncate font-semibold text-slate-900">
                                {turno.paciente.nombre.split(' ')[0]}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {turnosDelDia.length > 2 && (
                          <div className="text-xs text-slate-500 text-center font-medium">
                            +{turnosDelDia.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de detalle */}
      <TurnoDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, turno: null })}
        turno={detailModal.turno}
      />
    </div>
  )
}
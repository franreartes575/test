// pages/turnos.tsx
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Calendar as CalendarIcon, Search, Clock, CheckCircle, 
  XCircle, AlertCircle, ChevronLeft, ChevronRight, X, User,
  Stethoscope, Phone, FileText, Activity, AlertTriangle, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { Turno, Paciente, Profesional, AgendaProfesional } from '@/types'

type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE'
type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'

// Configuración de colores por estado
const estadoConfig = {
  PENDIENTE: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
    icon: Clock,
    label: 'Pendiente'
  },
  CONFIRMADO: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    icon: CheckCircle,
    label: 'Confirmado'
  },
  ATENDIDO: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    dot: 'bg-green-500',
    icon: CheckCircle,
    label: 'Atendido'
  },
  CANCELADO: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-500',
    icon: XCircle,
    label: 'Cancelado'
  },
  AUSENTE: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
    icon: AlertCircle,
    label: 'Ausente'
  }
}

export default function TurnosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedProfesional, setSelectedProfesional] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroFecha, setFiltroFecha] = useState<'hoy' | 'manana' | 'todos'>('hoy')
  const [filtroEstado, setFiltroEstado] = useState<EstadoTurno | 'TODOS'>('TODOS')
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    pacienteId: '',
    profesionalId: '',
    fecha: '',
    hora: '',
    motivo: '',
    observaciones: ''
  })
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  // Modal de confirmación de acción
  const [confirmActionModal, setConfirmActionModal] = useState<{
    isOpen: boolean
    turnoId: string | null
    nuevoEstado: EstadoTurno | null
    turno: Turno | null
  }>({
    isOpen: false,
    turnoId: null,
    nuevoEstado: null,
    turno: null
  })

  // Generar color consistente para cada profesional
  const getProfesionalColor = (profesionalId: string) => {
    const colors = [
      { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-100' },
      { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-100' },
      { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-100' },
      { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'bg-teal-100' },
      { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-100' },
      { bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'bg-indigo-100' },
    ]
    
    let hash = 0
    for (let i = 0; i < profesionalId.length; i++) {
      hash = profesionalId.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Abrir modal de confirmación
  const abrirConfirmacion = (turnoId: string, nuevoEstado: EstadoTurno) => {
    const turno = turnos.find(t => t.id === turnoId)
    setConfirmActionModal({
      isOpen: true,
      turnoId,
      nuevoEstado,
      turno: turno || null
    })
  }

  // Manejar cambio de estado del turno
  const handleCambiarEstado = async () => {
    const { turnoId, nuevoEstado } = confirmActionModal
    if (!turnoId || !nuevoEstado) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/turnos?id=${turnoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Estado actualizado',
          description: `El turno ha sido marcado como ${estadoConfig[nuevoEstado].label.toLowerCase()}`
        })
        
        setTurnos(turnos.map(t => 
          t.id === turnoId ? { ...t, estado: nuevoEstado } : t
        ))
      } else {
        addToast({
          type: 'error',
          title: 'Error al actualizar',
          description: result.message || 'No se pudo actualizar el estado del turno'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setConfirmActionModal({
        isOpen: false,
        turnoId: null,
        nuevoEstado: null,
        turno: null
      })
    }
  }

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        const [turnosRes, pacientesRes, profesionalesRes] = await Promise.all([
          fetch('/api/turnos', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/pacientes?filtro=activos', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/profesionales?filtro=activos', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const [turnosData, pacientesData, profesionalesData] = await Promise.all([
          turnosRes.json(),
          pacientesRes.json(),
          profesionalesRes.json()
        ])

        if (turnosData.success) setTurnos(turnosData.turnos)
        if (pacientesData.success) setPacientes(pacientesData.pacientes)
        if (profesionalesData.success) setProfesionales(profesionalesData.profesionales)
      } catch (error) {
        console.error('Error al cargar datos:', error)
        addToast({
          type: 'error',
          title: 'Error al cargar datos',
          description: 'No se pudieron cargar los datos del sistema'
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  // Calcular horarios disponibles
  useEffect(() => {
    if (formData.profesionalId && formData.fecha) {
      calcularHorariosDisponibles()
    } else {
      setHorariosDisponibles([])
    }
  }, [formData.profesionalId, formData.fecha, turnos])

  const calcularHorariosDisponibles = () => {
    const profesional = profesionales.find(p => p.id === formData.profesionalId)
    if (!profesional?.agendaProfesional || profesional.agendaProfesional.length === 0) {
      setHorariosDisponibles([])
      return
    }

    const fechaSeleccionada = new Date(formData.fecha)
    const diasSemana: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']
    const diaSemana = diasSemana[fechaSeleccionada.getDay()]
    
    const agendaDia = profesional.agendaProfesional.find(a => a.diaSemana === diaSemana)
    
    if (!agendaDia) {
      setHorariosDisponibles([])
      return
    }

    const horaInicio = new Date(agendaDia.horaInicio)
    const horaFin = new Date(agendaDia.horaFin)
    
    const horaInicioH = horaInicio.getUTCHours()
    const horaInicioM = horaInicio.getUTCMinutes()
    const horaFinH = horaFin.getUTCHours()
    const horaFinM = horaFin.getUTCMinutes()
    const duracionTurno = agendaDia.duracionTurno
    
    const slots: string[] = []
    let currentTime = horaInicioH * 60 + horaInicioM
    const endTime = horaFinH * 60 + horaFinM
    
    while (currentTime < endTime) {
      const horas = Math.floor(currentTime / 60)
      const minutos = currentTime % 60
      const slot = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
      
      const ocupado = turnos.some(t => {
        if (t.profesionalId !== formData.profesionalId || t.estado === 'CANCELADO') {
          return false
        }
        const turnoDate = new Date(t.fecha)
        const turnoDateStr = turnoDate.toISOString().split('T')[0]
        const selectedDateStr = fechaSeleccionada.toISOString().split('T')[0]
        const turnoTimeStr = `${turnoDate.getHours().toString().padStart(2, '0')}:${turnoDate.getMinutes().toString().padStart(2, '0')}`
        
        return turnoDateStr === selectedDateStr && turnoTimeStr === slot
      })
      
      if (!ocupado) {
        slots.push(slot)
      }
      
      currentTime += duracionTurno
    }
    
    setHorariosDisponibles(slots)
  }

  // Filtrar turnos según el filtro de fecha seleccionado
  const turnosFiltrados = useMemo(() => {
    return turnos.filter(turno => {
      const turnoDate = new Date(turno.fecha)
      
      let matchesFecha = false
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const manana = new Date(hoy)
      manana.setDate(manana.getDate() + 1)
      
      if (filtroFecha === 'hoy') {
        matchesFecha = turnoDate.toDateString() === hoy.toDateString()
      } else if (filtroFecha === 'manana') {
        matchesFecha = turnoDate.toDateString() === manana.toDateString()
      } else {
        matchesFecha = true
      }
      
      const matchesProfesional = !selectedProfesional || turno.profesionalId === selectedProfesional
      const matchesSearch = !searchTerm || 
        turno.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.paciente?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.paciente?.dni.includes(searchTerm)
      const matchesEstado = filtroEstado === 'TODOS' || turno.estado === filtroEstado
      
      return matchesFecha && matchesProfesional && matchesSearch && matchesEstado
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
  }, [turnos, filtroFecha, selectedProfesional, searchTerm, filtroEstado])

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!formData.pacienteId || !formData.profesionalId || !formData.fecha || !formData.hora) {
        addToast({
          type: 'error',
          title: 'Campos incompletos',
          description: 'Por favor complete todos los campos obligatorios'
        })
        setSubmitting(false)
        return
      }

      const [year, month, day] = formData.fecha.split('-').map(Number)
      const [hours, minutes] = formData.hora.split(':').map(Number)
      const fechaCompleta = new Date(year, month - 1, day, hours, minutes)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/turnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pacienteId: formData.pacienteId,
          profesionalId: formData.profesionalId,
          fecha: fechaCompleta.toISOString(),
          motivo: formData.motivo || undefined,
          observaciones: formData.observaciones || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        const paciente = pacientes.find(p => p.id === formData.pacienteId)
        const profesional = profesionales.find(p => p.id === formData.profesionalId)
        
        addToast({
          type: 'success',
          title: 'Turno creado exitosamente',
          description: `Turno para ${paciente?.nombre} ${paciente?.apellido} con Dr/a. ${profesional?.nombre} ${profesional?.apellido}`
        })
        
        setTurnos([...turnos, result.turno])
        
        setFormData({
          pacienteId: '',
          profesionalId: '',
          fecha: '',
          hora: '',
          motivo: '',
          observaciones: ''
        })
        setShowModal(false)
      } else {
        addToast({
          type: 'error',
          title: 'Error al crear turno',
          description: result.message || 'Ocurrió un error inesperado'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">Cargando turnos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-6 text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestión de Turnos</h1>
                  <p className="text-emerald-100 mt-1">Agenda y visualización de citas médicas</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Turno
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles y Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFiltroFecha('hoy')}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    filtroFecha === 'hoy'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setFiltroFecha('manana')}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    filtroFecha === 'manana'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Mañana
                </button>
                <button
                  onClick={() => setFiltroFecha('todos')}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    filtroFecha === 'todos'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left"
                  />
                </div>

                <Select
                  options={[
                    { value: '', label: 'Todos los profesionales' },
                    ...profesionales.map(prof => ({
                      value: prof.id,
                      label: `Dr/a. ${prof.nombre} ${prof.apellido}`
                    }))
                  ]}
                  value={selectedProfesional}
                  onChange={(e) => setSelectedProfesional(e.target.value)}
                  className="w-64"
                />

                {(searchTerm || selectedProfesional) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedProfesional('')
                      setFiltroEstado('TODOS')
                    }}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Leyenda de estados */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setFiltroEstado('TODOS')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'TODOS' 
                    ? 'bg-slate-100 ring-2 ring-slate-300' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span className="text-sm text-slate-700 font-medium">Todos</span>
              </button>
              <button
                onClick={() => setFiltroEstado('PENDIENTE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'PENDIENTE' 
                    ? 'bg-yellow-50 ring-2 ring-yellow-300' 
                    : 'hover:bg-yellow-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-slate-700 font-medium">Pendiente</span>
              </button>
              <button
                onClick={() => setFiltroEstado('CONFIRMADO')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'CONFIRMADO' 
                    ? 'bg-blue-50 ring-2 ring-blue-300' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-slate-700 font-medium">Confirmado</span>
              </button>
              <button
                onClick={() => setFiltroEstado('ATENDIDO')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'ATENDIDO' 
                    ? 'bg-green-50 ring-2 ring-green-300' 
                    : 'hover:bg-green-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-700 font-medium">Atendido</span>
              </button>
              <button
                onClick={() => setFiltroEstado('CANCELADO')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'CANCELADO' 
                    ? 'bg-red-50 ring-2 ring-red-300' 
                    : 'hover:bg-red-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-slate-700 font-medium">Cancelado</span>
              </button>
              <button
                onClick={() => setFiltroEstado('AUSENTE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'AUSENTE' 
                    ? 'bg-gray-50 ring-2 ring-gray-300' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-sm text-slate-700 font-medium">Ausente</span>
              </button>
            </div>
          </div>

          {/* Estadísticas del día */}
          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {turnosFiltrados.length}
                </div>
                <div className="text-sm text-slate-600">Total del día</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {turnosFiltrados.filter(t => t.estado === 'CONFIRMADO').length}
                </div>
                <div className="text-sm text-slate-600">Confirmados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {turnosFiltrados.filter(t => t.estado === 'PENDIENTE').length}
                </div>
                <div className="text-sm text-slate-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {turnosFiltrados.filter(t => t.estado === 'ATENDIDO').length}
                </div>
                <div className="text-sm text-slate-600">Atendidos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Turnos */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-emerald-600" />
                Turnos del Día
              </h2>
              {turnosFiltrados.length > 0 && (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                  {turnosFiltrados.length} turno{turnosFiltrados.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {turnosFiltrados.length > 0 ? (
              <div className="space-y-4">
                {turnosFiltrados.map((turno, index) => {
                  const config = estadoConfig[turno.estado]
                  const Icon = config.icon
                  
                  return (
                    <motion.div
                      key={turno.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 rounded-xl border-2 ${getProfesionalColor(turno.profesionalId).border} ${getProfesionalColor(turno.profesionalId).bg} hover:shadow-lg transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0 text-center">
                            <div className={`w-20 h-20 ${getProfesionalColor(turno.profesionalId).accent} rounded-xl flex flex-col items-center justify-center shadow-sm border-2 ${getProfesionalColor(turno.profesionalId).border}`}>
                              <Clock className="w-5 h-5 text-slate-600 mb-1" />
                              <div className="text-lg font-bold text-slate-900">
                                {new Date(turno.fecha).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'America/Argentina/Buenos_Aires'
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="mb-3">
                              <div className="flex items-center mb-1">
                                <User className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-xs font-medium text-slate-500 uppercase">Paciente</span>
                              </div>
                              <div className="text-lg font-bold text-slate-900">
                                {turno.paciente?.nombre} {turno.paciente?.apellido}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                                <span>DNI: {turno.paciente?.dni}</span>
                                {turno.paciente?.telefono && (
                                  <span className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {turno.paciente.telefono}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="flex items-center mb-1">
                                <Stethoscope className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-xs font-medium text-slate-500 uppercase">Profesional</span>
                              </div>
                              <div className="font-semibold text-slate-900">
                                Dr/a. {turno.profesional?.nombre} {turno.profesional?.apellido}
                              </div>
                              {turno.profesional?.especialidad && (
                                <span className="inline-block mt-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                  {turno.profesional.especialidad.nombre}
                                </span>
                              )}
                            </div>

                            {turno.motivo && (
                              <div>
                                <div className="flex items-center mb-1">
                                  <FileText className="w-4 h-4 text-slate-500 mr-2" />
                                  <span className="text-xs font-medium text-slate-500 uppercase">Motivo</span>
                                </div>
                                <p className="text-sm text-slate-700">{turno.motivo}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <div className="flex flex-col items-end space-y-3">
                            <span className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm min-w-[140px] justify-center ${
                              turno.estado === 'PENDIENTE' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                              turno.estado === 'CONFIRMADO' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                              turno.estado === 'ATENDIDO' ? 'bg-green-500 text-white hover:bg-green-600' :
                              turno.estado === 'CANCELADO' ? 'bg-red-500 text-white hover:bg-red-600' :
                              'bg-gray-500 text-white hover:bg-gray-600'
                            } transition-colors duration-150 cursor-default`}>
                              {config.label}
                            </span>

                            <div className="flex flex-col gap-2.5 w-full min-w-[140px]">
                              {turno.estado === 'PENDIENTE' && (
                                <>
                                  <button
                                    onClick={() => abrirConfirmacion(turno.id, 'CONFIRMADO')}
                                    className="w-full px-4 py-2.5 bg-blue-500 border border-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Confirmar</span>
                                  </button>
                                  <button
                                    onClick={() => abrirConfirmacion(turno.id, 'CANCELADO')}
                                    className="w-full px-4 py-2.5 bg-red-500 border border-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Cancelar</span>
                                  </button>
                                </>
                              )}

                              {turno.estado === 'CONFIRMADO' && (
                                <>
                                  <button
                                    onClick={() => abrirConfirmacion(turno.id, 'ATENDIDO')}
                                    className="w-full px-4 py-2.5 bg-green-500 border border-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Atendido</span>
                                  </button>
                                  <button
                                    onClick={() => abrirConfirmacion(turno.id, 'AUSENTE')}
                                    className="w-full px-4 py-2.5 bg-gray-500 border border-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Ausente</span>
                                  </button>
                                  <button
                                    onClick={() => abrirConfirmacion(turno.id, 'CANCELADO')}
                                    className="w-full px-4 py-2.5 bg-red-500 border border-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Cancelar</span>
                                  </button>
                                </>
                              )}

                              {(turno.estado === 'ATENDIDO' || turno.estado === 'AUSENTE') && (
                                <button
                                  onClick={() => abrirConfirmacion(turno.id, 'CANCELADO')}
                                  className="w-full px-4 py-2.5 bg-red-500 border border-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Cancelar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay turnos para mostrar
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || selectedProfesional
                    ? 'No se encontraron turnos con los filtros aplicados'
                    : 'No hay turnos programados para esta fecha'}
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primer Turno
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Creación */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Crear Nuevo Turno</h3>
                      <p className="text-emerald-100">Complete los datos del turno</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  <Select
                    label="Paciente *"
                    value={formData.pacienteId}
                    onChange={(e) => setFormData({...formData, pacienteId: e.target.value})}
                    options={pacientes.map(paciente => ({
                      value: paciente.id,
                      label: `${paciente.nombre} ${paciente.apellido} - DNI: ${paciente.dni}`
                    }))}
                    placeholder="Seleccionar paciente"
                  />

                  <Select
                    label="Profesional *"
                    value={formData.profesionalId}
                    onChange={(e) => setFormData({...formData, profesionalId: e.target.value, hora: ''})}
                    options={profesionales.map(prof => ({
                      value: prof.id,
                      label: `Dr/a. ${prof.nombre} ${prof.apellido} - ${prof.especialidad?.nombre || 'Sin especialidad'}`
                    }))}
                    placeholder="Seleccionar profesional"
                  />

                  <Input
                    label="Fecha *"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value, hora: ''})}
                    min={new Date().toISOString().split('T')[0]}
                  />

                  {formData.profesionalId && formData.fecha && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Horario Disponible *
                      </label>
                      {horariosDisponibles.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {horariosDisponibles.map(hora => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => setFormData({...formData, hora})}
                              className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                                formData.hora === hora
                                  ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {hora}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-800 text-sm">
                              El profesional no tiene horarios disponibles para esta fecha.
                              Por favor seleccione otra fecha.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Input
                    label="Motivo de la consulta"
                    value={formData.motivo}
                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    placeholder="Ej: Control rutinario, primera consulta..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      rows={3}
                      placeholder="Información adicional..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setFormData({
                        pacienteId: '',
                        profesionalId: '',
                        fecha: '',
                        hora: '',
                        motivo: '',
                        observaciones: ''
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={!formData.hora}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Crear Turno
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Acción */}
      <AnimatePresence>
        {confirmActionModal.isOpen && confirmActionModal.turno && confirmActionModal.nuevoEstado && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className={`px-8 py-6 ${
                confirmActionModal.nuevoEstado === 'CANCELADO' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                confirmActionModal.nuevoEstado === 'CONFIRMADO' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                confirmActionModal.nuevoEstado === 'ATENDIDO' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                'bg-gradient-to-r from-gray-500 to-slate-600'
              }`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      {confirmActionModal.nuevoEstado === 'CANCELADO' && <XCircle className="w-6 h-6" />}
                      {confirmActionModal.nuevoEstado === 'CONFIRMADO' && <CheckCircle className="w-6 h-6" />}
                      {confirmActionModal.nuevoEstado === 'ATENDIDO' && <CheckCircle className="w-6 h-6" />}
                      {confirmActionModal.nuevoEstado === 'AUSENTE' && <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Confirmar Acción</h3>
                      <p className="text-white/90 text-sm">Esta acción modificará el estado del turno</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <p className="text-slate-700 text-center mb-4">
                    ¿Está seguro que desea marcar este turno como <span className="font-bold">{estadoConfig[confirmActionModal.nuevoEstado].label}</span>?
                  </p>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Paciente:</span>
                        <span className="font-semibold text-slate-900">
                          {confirmActionModal.turno.paciente?.nombre} {confirmActionModal.turno.paciente?.apellido}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Profesional:</span>
                        <span className="font-semibold text-slate-900">
                          Dr/a. {confirmActionModal.turno.profesional?.nombre} {confirmActionModal.turno.profesional?.apellido}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Fecha y hora:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(confirmActionModal.turno.fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} - {new Date(confirmActionModal.turno.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setConfirmActionModal({ isOpen: false, turnoId: null, nuevoEstado: null, turno: null })}
                    className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCambiarEstado}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-colors ${
                      confirmActionModal.nuevoEstado === 'CANCELADO' ? 'bg-red-600 hover:bg-red-700' :
                      confirmActionModal.nuevoEstado === 'CONFIRMADO' ? 'bg-blue-600 hover:bg-blue-700' :
                      confirmActionModal.nuevoEstado === 'ATENDIDO' ? 'bg-green-600 hover:bg-green-700' :
                      'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}